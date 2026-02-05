export interface IDatabase {
  init(): Promise<void>;
  isAvailable(): boolean;
  /** Run a SELECT and return all rows as objects */
  queryAll<T = any>(sql: string, params?: any[]): T[];
  /** Close the underlying DB if supported */
  close?(): void;
}
