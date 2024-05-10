import mime from 'mime'
import { createReadStream, ReadStream } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUiDist from 'swagger-ui-dist'
import { HttpContext } from '@adonisjs/core/http'
import type { ApplicationService } from '@adonisjs/core/types'
import buildJsDocConfig from './utils/build_js_doc_config.js'

export class SwaggerController {
  #app: ApplicationService

  /**
   * Constructor
   */
  constructor(app: ApplicationService) {
    this.#app = app
  }

  /**
   * Swagger UI
   */
  async swaggerUI({ params, response }: HttpContext) {
    const config = this.#app.config
    const swaggerUiAssetPath: string =
      config.get('swagger.swaggerUiDistPath') || swaggerUiDist.getAbsoluteFSPath()
    if (!params.fileName) {
      const uiUrl = config.get('swagger.uiUrl', '/docs')
      const baseUrl = typeof uiUrl === 'string' ? uiUrl.replace('/', '') : ''
      return response.redirect(`/${baseUrl}/index.html`)
    }

    const fileName = params.fileName ? params.fileName : 'index.html'
    const path = join(swaggerUiAssetPath, fileName)
    const contentType = mime.getType(path) || 'application/json'

    if (fileName.includes('initializer')) {
      const initializer = await readFile(path, 'utf-8')
      return response
        .header('Content-Type', contentType)
        .send(
          initializer.replace(
            'https://petstore.swagger.io/v2/swagger.json',
            config.get('swagger.specUrl')
          )
        )
    } else {
      return response.header('Content-Type', contentType).stream(createReadStream(path))
    }
  }

  /**
   * Swagger file
   */
  async swaggerFile({ response }: HttpContext): Promise<void> {
    const config = this.#app.config
    const mode = config.get('swagger.mode', 'RUNTIME')
    if (mode === 'RUNTIME') {
      response.send(swaggerJSDoc(buildJsDocConfig(config.get('swagger.options', {}))))
    } else {
      response
        .safeHeader('Content-type', 'application/json')
        .stream(this.getSwaggerSpecFileContent(), () => {
          return ['Unable to find file', 404]
        })
    }
  }

  /**
   * Get swagger spec file content
   */
  protected getSwaggerSpecFileContent(): ReadStream {
    // @TODO
    // const filePath = join(this.#app.appRoot., config.get('swagger.specFilePath'))
    const config = this.#app.config
    const filePath = relative(fileURLToPath(this.#app.appRoot), config.get('swagger.specFilePath'))
    return createReadStream(filePath)
  }
}
