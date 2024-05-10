import { ApplicationService } from '@adonisjs/core/types'
import { SwaggerAuthConfig } from '../src/types.js'
import { AuthMiddleware } from '../src/auth/auth_middleware.js'
import { AuthHeaderDecoder } from '../src/auth/auth_header_decoder.js'
import { SwaggerController } from '../src/swagger_controller.js'

export default class SwaggerProvider {
  static needsApplication = true

  /**
   * Constructor
   */
  constructor(protected app: ApplicationService) {}

  /**
   * Register
   */
  register(): void {
    this.registerMiddleware()
  }

  /**
   * Boot
   */
  async boot(): Promise<void> {
    return this.initSwaggerRoutes()
  }

  /**
   * Register middleware
   */
  protected registerMiddleware(): void {
    this.app.container.singleton(AuthMiddleware, () => {
      const swaggerAuth = this.app.config.get<SwaggerAuthConfig>('swagger.swaggerAuth')
      return new AuthMiddleware(swaggerAuth, new AuthHeaderDecoder())
    })
  }

  /**
   * Init swagger routes
   */
  private async initSwaggerRoutes() {
    const config = await this.app.config
    const router = await this.app.container.make('router')

    const controller = new SwaggerController(this.app)
    if (config.get('swagger.uiEnabled', true)) {
      router
        .get(
          `${config.get('swagger.uiUrl', 'docs')}/:fileName?`,
          controller.swaggerUI.bind(controller)
        )
        .middleware(config.get('swagger.middleware', []))
    }

    if (config.get('swagger.specEnabled', true)) {
      router
        .get(config.get('swagger.specUrl'), controller.swaggerFile.bind(controller))
        .middleware(config.get('swagger.middleware', []))
    }
  }

  /**
   * Merge auth middleware
   */
  protected async mergeAuthMiddleware(middlewares: string[]): Promise<string[]> {
    const config = await this.app.config

    return config.get('swagger.swaggerAuth.authMiddleware')
      ? middlewares.concat(config.get('swagger.swaggerAuth.authMiddleware'))
      : middlewares
  }
}
