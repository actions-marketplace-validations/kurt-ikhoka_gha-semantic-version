import fs from 'fs'
import {VersionType} from './version-type'

export class Validator {
  readonly update_type: string
  readonly version_name: string
  readonly version_code: string
  readonly file_path: string

  constructor(
    update_type: string,
    version_name: string,
    version_code: string,
    file_path: string
  ) {
    this.update_type = update_type.toLowerCase()
    this.version_name = version_name !== undefined ? version_name : ''
    this.version_code = version_code !== undefined ? version_code : ''
    this.file_path = file_path !== undefined ? file_path : ''
  }

  checkUpdateType(): void {
    if (this.update_type === '') {
      throw Error('update_type is required')
    }

    if (
      this.update_type !== VersionType.major &&
      this.update_type !== VersionType.minor &&
      this.update_type !== VersionType.patch &&
      this.update_type !== VersionType.pre_release &&
      this.update_type !== VersionType.release
    ) {
      throw Error(
        'update_type must be set to  major, minor, patch ,pre-release or release'
      )
    }
  }

  checkVersioning(): void {
    if (this.version_name === '' && this.file_path === '') {
      throw Error('version_name is required if file_path is not provided')
    }
    if (
      (this.version_code === '' || !this.isNumber(this.version_code)) &&
      this.file_path === ''
    ) {
      throw Error('version_code is required if file_path is not provided')
    }
  }

  checkFilePath(): void {
    if (this.file_path !== '' && !this.fileExists(this.file_path)) {
      throw Error(`file_path ${this.file_path} does not exist`)
    }
  }

  private fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  private isNumber(value: string): boolean {
    // Use parseFloat to parse the value as a number, and then use isNaN to check if the parsed value is NaN
    return !isNaN(parseFloat(value))
  }
}
