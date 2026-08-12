import fs from 'fs'
import path from 'path'

// Seeded random number generator
class Random {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  // Random integer between min and max (inclusive)
  randint(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Random item from array
  choice<T>(arr: T[]): T {
    return arr[this.randint(0, arr.length - 1)];
  }

  // Multiple unique choices
  sample<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr].sort(() => this.next() - 0.5);
    return shuffled.slice(0, n);
  }
}

const SKILLS = ['PLUMBER', 'ELECTRICIAN', 'CARPENTER', 'MASON', 'PAINTER', 'GARDENER', 'CLEANER', 'TECHNICIAN']
const TAGS = ['reliable', 'punctual', 'expert', 'affordable', 'fast', 'friendly', 'tidy', 'polite', 'thorough', 'experienced', 'flexible', 'communicative', 'proactive', 'honest']

const NUM_WORKERS = 300
const NUM_CUSTOMERS = 300
const SEED = 42

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function generateData() {
  const rng = new Random(SEED);

  const workers = [];
  for (let i = 0; i < NUM_WORKERS; i++) {
    workers.push({
      id: `w${i}`,
      skill: rng.choice(SKILLS),
      tags: rng.sample(TAGS, rng.randint(2, 5)),
      dailyRate: rng.randint(50, 300),
      rating: rng.randint(30, 50) / 10, // 3.0 to 5.0
      totalReviews: rng.randint(0, 150),
      latitude: 6.9271 + (rng.next() - 0.5) * 0.1, // Near Colombo
      longitude: 79.8612 + (rng.next() - 0.5) * 0.1
    });
  }

  const requests = [];
  for (let i = 0; i < NUM_CUSTOMERS; i++) {
    const skill = rng.choice(SKILLS);
    const lat = 6.9271 + (rng.next() - 0.5) * 0.1;
    const lng = 79.8612 + (rng.next() - 0.5) * 0.1;
    const reqTags = rng.sample(TAGS, rng.randint(1, 3));
    const budget = rng.randint(100, 400);

    // Compute multinomial logit utilities for all workers with matching skill
    const candidates = workers.filter(w => w.skill === skill);
    
    const scoredCandidates = candidates.map(w => {
      // 1. Distance penalty (closer is better)
      const dist = calculateDistance(lat, lng, w.latitude, w.longitude);
      const distScore = Math.max(0, 1 - (dist / 10)); // Max 10km

      // 2. Price fit (budget - dailyRate, max 0, normalized)
      const priceFit = w.dailyRate <= budget ? 1 : Math.max(0, 1 - ((w.dailyRate - budget) / budget));

      // 3. Rating score
      const ratingScore = w.rating / 5.0;

      // 4. Tag overlap
      const overlap = w.tags.filter(t => reqTags.includes(t)).length;
      const tagScore = reqTags.length > 0 ? overlap / reqTags.length : 0;

      // True Utility weights from the "paper"
      const utility = (
        1.5 * distScore +
        2.0 * priceFit +
        1.0 * ratingScore +
        1.0 * tagScore
      );

      // Add Gumbel noise for multinomial logit
      const gumbelNoise = -Math.log(-Math.log(rng.next()));
      
      return {
        id: w.id,
        trueUtility: utility + (0.5 * gumbelNoise)
      };
    });

    // Sort by true utility descending
    scoredCandidates.sort((a, b) => b.trueUtility - a.trueUtility);
    
    requests.push({
      customerId: `c${i}`,
      skill,
      latitude: lat,
      longitude: lng,
      budget,
      tags: reqTags,
      groundTruth: {
        true_top1: scoredCandidates[0]?.id || null,
        true_top2: scoredCandidates[1]?.id || null,
        true_top3: scoredCandidates[2]?.id || null
      }
    });
  }

  const outDir = path.join(process.cwd(), 'eval-data');
  fs.writeFileSync(path.join(outDir, 'workers.json'), JSON.stringify(workers, null, 2));
  fs.writeFileSync(path.join(outDir, 'requests.json'), JSON.stringify(requests, null, 2));

  console.log(`Generated ${NUM_WORKERS} workers and ${NUM_CUSTOMERS} requests in eval-data/`);
}

generateData();
