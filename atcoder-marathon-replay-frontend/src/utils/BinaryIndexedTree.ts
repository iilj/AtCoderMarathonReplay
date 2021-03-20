export class BinaryIndexedTree {
  data: number[];
  length: number;
  constructor(_length: number) {
    this.length = _length;
    this.data = (Array(++_length) as number[]).fill(0);
  }
  sum(k: number): number {
    let ret = 0;
    for (++k; k > 0; k -= k & -k) ret += this.data[k];
    return ret;
  }
  add(k: number, x: number): void {
    for (++k; k < this.data.length; k += k & -k) this.data[k] += x;
  }
  // query for [l, r)
  query(l: number, r: number): number {
    return this.sum(r - 1) - this.sum(l - 1);
  }
}
