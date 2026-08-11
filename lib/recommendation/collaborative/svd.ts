import { Matrix, SVD } from 'ml-matrix';

/**
 * Computes the Truncated Singular Value Decomposition (SVD) of a user-item matrix.
 * 
 * SVD factorizes a matrix A into U * S * V^T
 * By truncating to nComponents (k), we get an approximation A ≈ U_k * S_k * V_k^T
 * 
 * We return the latent factors scaled by the singular values:
 * customerFactors = U_k * sqrt(S_k)
 * workerFactors = V_k * sqrt(S_k)
 * 
 * @param matrix The customer x worker interaction matrix
 * @param nComponents The number of latent features to keep (default 12 to match paper configuration)
 * @returns An object containing customerFactors and workerFactors matrices
 */
export function computeTruncatedSVD(matrix: number[][], nComponents = 12): { customerFactors: number[][], workerFactors: number[][] } {
    if (matrix.length === 0 || matrix[0].length === 0) {
        return { customerFactors: [], workerFactors: [] };
    }
    
    let mat = new Matrix(matrix);
    
    // ml-matrix SVD expects rows >= columns for standard compute.
    // If we have more columns (workers) than rows (customers), we transpose the matrix,
    // compute SVD, and then swap U and V back to correspond to the original matrix.
    const transposed = mat.rows < mat.columns;
    if (transposed) {
        mat = mat.transpose();
    }
    
    // Compute Full SVD (autoTranspose is handled by our manual transposition to ensure predictable U/V extraction)
    const svd = new SVD(mat, { autoTranspose: false });
    
    let U = svd.U;
    let V = svd.V;
    const s = svd.diagonal;
    
    if (transposed) {
        // If we computed SVD(A^T) -> A^T = U * S * V^T
        // Then A = V * S * U^T
        // So for original A, left singular vectors are V, and right singular vectors are U
        const temp = U;
        U = V;
        V = temp;
    }
    
    // Number of components to actually use (in case matrix rank is smaller than requested nComponents)
    const k = Math.min(nComponents, s.length);
    
    const customerFactors: number[][] = [];
    const workerFactors: number[][] = [];
    
    const numCustomers = matrix.length;
    const numWorkers = matrix[0].length;
    
    // Extract customer latent factors: U_k * sqrt(S_k)
    for (let i = 0; i < numCustomers; i++) {
        const row = new Array(k);
        for (let j = 0; j < k; j++) {
            row[j] = U.get(i, j) * Math.sqrt(s[j]);
        }
        customerFactors.push(row);
    }
    
    // Extract worker latent factors: V_k * sqrt(S_k)
    for (let i = 0; i < numWorkers; i++) {
        const row = new Array(k);
        for (let j = 0; j < k; j++) {
            row[j] = V.get(i, j) * Math.sqrt(s[j]);
        }
        workerFactors.push(row);
    }
    
    return { customerFactors, workerFactors };
}
