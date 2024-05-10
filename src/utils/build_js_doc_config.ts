import swaggerJSDoc from 'swagger-jsdoc'
import resolveApiPaths from './resolve_apis.js'

export default function ({ apis, ...restOptions }: swaggerJSDoc.Options): swaggerJSDoc.Options {
  return {
    ...restOptions,
    apis: resolveApiPaths(apis as string[]),
  }
}
