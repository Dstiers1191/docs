import got from 'got'
import type { Response, NextFunction } from 'express'

import patterns from '@/frame/lib/patterns'
import { isArchivedVersion } from '@/archives/lib/is-archived-version'
import { setFastlySurrogateKey, SURROGATE_ENUMS } from '@/frame/middleware/set-fastly-surrogate-key'
import { archivedCacheControl, defaultCacheControl } from '@/frame/middleware/cache-control'
import type { ExtendedRequest } from '@/types'

// This module handles requests for the CSS and JS assets for
// deprecated GitHub Enterprise versions by routing them to static content in
// one of the docs-ghes-<release number> repos.
// See also ./archived-enterprise-versions.js for non-CSS/JS paths

export default async function archivedEnterpriseVersionsAssets(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) {
  // Only match asset paths
  // This can be true on /enterprise/2.22/_next/static/foo.css
  // or /_next/static/foo.css
  if (!patterns.assetPaths.test(req.path)) return next()

  // The URL is either in the format
  // /enterprise/2.22/_next/static/foo.css,
  // /enterprise-server@<release>,
  // or /_next/static/foo.css.
  // If the URL is prefixed with the enterprise version and release number
  // or if the Referrer contains the enterprise version and release number,
  // then we'll fetch it from the docs-ghes-<release number> repo.
  if (
    !(
      patterns.getEnterpriseVersionNumber.test(req.path) ||
      patterns.getEnterpriseServerNumber.test(req.path) ||
      patterns.getEnterpriseVersionNumber.test(req.get('referrer') || '') ||
      patterns.getEnterpriseServerNumber.test(req.get('referrer') || '')
    )
  ) {
    return next()
  }

  // Now we know the URL is definitely not /_next/static/foo.css
  // So it's probably /enterprise/2.22/_next/static/foo.css and we
  // should see if we might find this in the proxied backend.
  // But `isArchivedVersion()` will only return truthy if the
  // Referrer header also indicates that the request for this static
  // asset came from a page
  const { isArchived, requestedVersion } = isArchivedVersion(req)
  if (!isArchived || !requestedVersion) return next()

  // If this looks like a Next.js chunk or build manifest request from an archived page,
  // just return 204 No Content instead of trying to proxy it.
  // This suppresses noise from hydration requests that don't affect
  // content viewing since archived pages render fine server-side.
  // Only target specific problematic asset types, not all _next/static assets.
  if (
    (req.path.includes('/_next/static/chunks/') ||
      req.path.includes('/_buildManifest.js') ||
      req.path.includes('/_ssgManifest.js')) &&
    (req.get('referrer') || '').match(/enterprise(-server@|\/)[\d.]+/)
  ) {
    archivedCacheControl(res)
    setFastlySurrogateKey(res, SURROGATE_ENUMS.MANUAL)
    return res.sendStatus(204) // No Content - silently ignore
  }

  // In all of the `docs-ghes-<relase number` repos, the asset directories
  // are at the root. This removes the version and release number from the
  // asset path so that we can proxy the request to the correct location.
  const newEnterprisePrefix = `/enterprise-server@${requestedVersion}`
  const legacyEnterprisePrefix = `/enterprise/${requestedVersion}`
  const assetPath = req.path.replace(newEnterprisePrefix, '').replace(legacyEnterprisePrefix, '')

  // Just to be absolutely certain that the path can not contain
  // a URL that might trip up the GET we're about to make.
  if (
    assetPath.includes('../') ||
    assetPath.includes('://') ||
    (assetPath.includes(':') && assetPath.includes('@'))
  ) {
    defaultCacheControl(res)
    return res.status(404).type('text/plain').send('Asset path not valid')
  }

  const proxyPath = `https://github.github.com/docs-ghes-${requestedVersion}${assetPath}`
  try {
    const r = await got(proxyPath)

    res.set('accept-ranges', 'bytes')
    res.set('content-type', r.headers['content-type'])
    res.set('content-length', r.headers['content-length'])
    res.set('x-is-archived', 'true')
    res.set('x-robots-tag', 'noindex')

    // This cache configuration should match what we do for archived
    // enterprise version URLs that are not assets.
    archivedCacheControl(res)
    setFastlySurrogateKey(res, SURROGATE_ENUMS.MANUAL)

    return res.send(r.body)
  } catch (err) {
    // Primarily for the developers working on tests that mock
    // requests. If you don't set up `nock` correctly, you might
    // not realize that and think it failed for other reasons.
    if (err instanceof Error && err.toString().includes('Nock: No match for request')) {
      throw err
    }

    // It's important that we don't give up on this by returning a 404
    // here. It's better to let this through in case the asset exists
    // beyond the realm of archived enterprise versions.
    // For example, image you load
    // /enterprise-server@2.21/en/DOES/NOT/EXIST in your browser.
    // Quickly, we discover that the proxying is failing because
    // it didn't find a page called `/en/DOES/NOT/EXIST` over there.
    // So, we proceed to render *our* 404 HTML page.
    // Now, on that 404 page, it will reference static assets too.
    // E.g. <link href="/_next/static/styles.css">
    // These will thus be requested, with a Referrer header that
    // forces us to give it a chance, but it'll find it can't find it
    // but we mustn't return a 404 yet, because that
    // /_next/static/styles.css will probably still succeed because the 404
    // page is not that of the archived enterprise version.
    return next()
  }
}
