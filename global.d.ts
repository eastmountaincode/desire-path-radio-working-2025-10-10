export {};

declare global {
    var createTestEpisodeData: (overrides?: Record<string, any>) => any;
    var cleanupTestData: (supabase: any) => Promise<void>;
}
