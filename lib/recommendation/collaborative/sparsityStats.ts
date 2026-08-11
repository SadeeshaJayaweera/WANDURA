export function computeSparsityStats(matrix: number[][]): {
  totalCells: number;
  nonZeroCells: number;
  sparsityPct: number;
  avgInteractionsPerCustomer: number;
} {
  if (matrix.length === 0 || matrix[0].length === 0) {
    return {
      totalCells: 0,
      nonZeroCells: 0,
      sparsityPct: 100,
      avgInteractionsPerCustomer: 0,
    };
  }

  const numCustomers = matrix.length;
  const numWorkers = matrix[0].length;
  const totalCells = numCustomers * numWorkers;
  
  let nonZeroCells = 0;
  
  for (let i = 0; i < numCustomers; i++) {
    for (let j = 0; j < numWorkers; j++) {
      if (matrix[i][j] > 0) {
        nonZeroCells++;
      }
    }
  }
  
  const sparsityPct = totalCells > 0 
    ? ((totalCells - nonZeroCells) / totalCells) * 100 
    : 100;
    
  const avgInteractionsPerCustomer = numCustomers > 0 
    ? nonZeroCells / numCustomers 
    : 0;

  return {
    totalCells,
    nonZeroCells,
    sparsityPct,
    avgInteractionsPerCustomer,
  };
}
