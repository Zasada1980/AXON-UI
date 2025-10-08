// Shared Spark typings and global declaration

export type Spark = {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
};

declare global {
  interface Window {
    spark: Spark;
  }
}

export {};
