import {Properties} from './properties'
import fs from 'fs'
import {Version} from './version'
import {VersionInfo} from './version-info'

export class SemanticVersion {
  readonly version_name_key: string
  readonly version_code_key: string

  constructor(version_name_key?: string, version_code_key?: string) {
    this.version_code_key = version_code_key ?? 'version_code'
    this.version_name_key = version_name_key ?? 'version_name'
  }

  update(
    updateType: string,
    version_name?: string,
    version_code?: number,
    filePath?: string
  ): VersionInfo {
    let old_name: string = version_name ? version_name : ''
    let old_code: number = isNaN(version_code ?? NaN)
      ? -1
      : (version_code as number)
    // check if file exists if exists then read it and parse version and version code
    if (filePath !== undefined && this.fileExists(filePath)) {
      const properties = new Properties(filePath)
      const name = properties.getValue(this.version_name_key)
      const code = properties.getValue(this.version_code_key)
      if (!code || !this.isNumber(code)) {
        throw new Error('invalid version code')
      }
      if (!name) {
        throw new Error('invalid version')
      }
      old_code = parseInt(code)
      old_name = name
    } else {
      //else  read version and version code
      if (isNaN(old_code)) {
        throw new Error('invalid version code')
      }
      if (!version_name) {
        throw new Error('invalid version')
      }
    }

    // generate new version and version code
    const versionInfo = this.generateVersion(updateType, old_name, old_code)
    if (filePath != null && this.fileExists(filePath)) {
      const properties = new Properties(filePath)
      properties.setValue(this.version_name_key, versionInfo.version_name)
      properties.setValue(
        this.version_code_key,
        versionInfo.version_code.toString()
      )
      properties.saveToFile()
    }
    return versionInfo
  }

  private generateVersion(
    update_type: string,
    name: string,
    code: number
  ): VersionInfo {
    const old_version = Version.parse(name)
    let new_version: Version
    let new_code: number = code
    new_code = new_code + 1
    if (update_type === 'major') {
      new_version = old_version.nextMajor()
    } else if (update_type === 'minor') {
      new_version = old_version.nextMinor()
    } else if (update_type === 'patch') {
      new_version = old_version.nextPatch()
    } else if (update_type === 'build') {
      // const preRelease = format(new Date(), 'ddMMMHHmm').toUpperCase();
      new_version = old_version.copy(
        old_version.major,
        old_version.minor,
        old_version.patch,
        `${new_code}`
      )
    } else {
      throw new Error('invalid update type')
    }
    return new VersionInfo(new_version.toString(), new_code)
  }

  private fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  private isNumber(value: string): boolean {
    // Use parseFloat to parse the value as a number, and then use isNaN to check if the parsed value is NaN
    return !isNaN(parseFloat(value))
  }
}
