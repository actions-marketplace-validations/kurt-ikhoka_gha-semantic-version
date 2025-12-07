import {Properties} from './properties'
import fs from 'fs'
import {Version} from './version'
import {VersionInfo} from './version-info'
import * as core from '@actions/core'
import {VersionType} from './version-type'

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
    version_name_postfix?: string,
    version_code?: number,
    filePath?: string
  ): VersionInfo {
    let old_name: string = version_name ? version_name : '0.0.1'
    const parsed_version = Version.parse(old_name)
    old_name = `${parsed_version.major}.${parsed_version.minor}.${parsed_version.patch}`
    let old_code: number = isNaN(version_code ?? NaN)
      ? -1
      : (version_code as number)
    // check if file exists if exists then read it and parse version and version code
    if (filePath !== undefined && this.fileExists(filePath)) {
      const properties = new Properties(filePath)
      const name = properties.getValue(this.version_name_key)
      const code = properties.getValue(this.version_code_key)
      core.info(
        'update()  type:$updateType name:${name}  code:${code}  file:${filePath}'
      )

      if (!code || !this.isNumber(code)) {
        throw new Error('invalid version code')
      }
      if (!name) {
        throw new Error('invalid version')
      }
      old_code = parseInt(code)
      old_name = name
    } else {
      core.debug(`old_name  ${old_name}`)
      core.debug(`old_code  ${old_code}`)
      core.debug(
        `update()  type:${updateType} name:${version_name}  code:${version_code}  file:${filePath}`
      )
      //else  read version and version code
      if (isNaN(old_code)) {
        throw new Error('invalid version code')
      }
      if (!version_name) {
        throw new Error('invalid version')
      }
    }

    // generate new version and version code
    const versionInfo = this.generateVersion(
      updateType,
      old_name,
      old_code,
      version_name_postfix
    )
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
    code: number,
    postfix?: string
  ): VersionInfo {
    const old_version = Version.parse(name)
    let new_version: Version
    let new_code: number = code
    new_code = new_code + 1
    if (update_type === VersionType.major) {
      new_version = old_version.nextMajor()
    } else if (update_type === VersionType.minor) {
      new_version = old_version.nextMinor()
    } else if (update_type === VersionType.patch) {
      new_version = old_version.nextPatch()
    } else if (update_type === VersionType.pre_release) {
      const preRelease = postfix
        ? `${postfix}.${new_code}`
        : new_code.toString()
      new_version = old_version.copy(
        old_version.major,
        old_version.minor,
        old_version.patch,
        preRelease
      )
    } else if (update_type === VersionType.release) {
      new_version = Version.create(
        old_version.major,
        old_version.minor,
        old_version.patch,
        undefined,
        undefined
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
