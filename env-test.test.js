// Simple test to verify environment variables are loaded
describe('Environment Variables', () => {
  test('should have Supabase URL', () => {
    // console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')
    // console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    // console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET')
    // console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined()
  })
})
