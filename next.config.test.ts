import config from './next.config'

test('allows the live Cloudflare media hostname used by shop uploads', () => {
  expect(config.images?.remotePatterns).toContainEqual({ protocol: 'https', hostname: 'media.desirepathradio.com' })
})
