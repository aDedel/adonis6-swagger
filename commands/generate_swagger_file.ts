import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import swaggerJSDoc from 'swagger-jsdoc'
import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import buildJsDocConfig from '../src/utils/build_js_doc_config.js'

export default class GenerateSwaggerFile extends BaseCommand {
  /**
   * The name of the command
   */
  static commandName: string = 'swagger:generate'
  /**
   * The command description to show on the help
   * screen
   */
  static description: string = 'Generate swagger file'
  /**
   * Configuration options accepted by the command
   */
  static options: CommandOptions = {
    loadApp: true,
    startApp: true,
  }
  /**
   * Execute command
   */
  async run(): Promise<void> {
    const config = this.app.config
    const swaggerFileContent = swaggerJSDoc(buildJsDocConfig(config.get('swagger.options', {})))

    if (!config.get('swagger.specFilePath')) {
      throw new Error(
        "Config option 'swagger.specFilePath' should be specified for using this command"
      )
    }

    const filePath = join(this.app.appRoot.pathname, config.get('swagger.specFilePath'))
    await writeFile(filePath, JSON.stringify(swaggerFileContent))
  }
}
