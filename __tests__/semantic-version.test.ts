import {SemanticVersion} from '../src/semantic-version'
import {describe, expect, it, beforeEach} from '@jest/globals'
import {Properties} from '../src/properties'
import * as path from 'path'
import {VersionType} from '../src/version-type'
import {afterEach} from 'node:test'

const file_path = path.join(__dirname, '.', 'version.properties')
const pre_file_path = path.join(__dirname, '.', 'version-pre.properties')
function resetFile() {
  const properties = new Properties(file_path)
  properties.setValue('myapp.version.name', '4.0.0')
  properties.setValue('myapp.version.code', '4')
  properties.saveToFile()

  const properties2 = new Properties(pre_file_path)
  properties2.setValue('myapp.version.name', '4.0.0-beta.4')
  properties2.setValue('myapp.version.code', '4')
  properties2.saveToFile()
}

describe('version updates without properties file', () => {
  const version = new SemanticVersion(
    'myapp.version.name',
    'myapp.version.code'
  )

  it('can bump to a PATCH version', () => {
    const version = new SemanticVersion()
    const new_version = version.update(
      VersionType.patch,
      '4.0.0',
      undefined,
      4,
      undefined
    )
    expect(new_version.version_name).toEqual('4.0.1')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a PATCH version', () => {
    const version = new SemanticVersion()
    const new_version = version.update(
      VersionType.patch,
      '4.0.0-beta.4',
      'beta',
      4,
      undefined
    )
    expect(new_version.version_name).toEqual('4.0.1')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump to a MINOR version', () => {
    const new_version = version.update(
      VersionType.minor,
      '4.0.0',
      undefined,
      4,
      undefined
    )
    expect(new_version.version_name).toEqual('4.1.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a MINOR version', () => {
    const new_version = version.update(
      VersionType.minor,
      '4.0.0-beta.4',
      'beta',
      4,
      undefined
    )
    expect(new_version.version_name).toEqual('4.1.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump to a MAJOR version', async () => {
    const new_version = version.update(
      VersionType.major,
      '4.1.0',
      undefined,
      4,
      undefined
    )
    expect(new_version.version_name).toEqual('5.0.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a MAJOR version', async () => {
    const new_version = version.update(
      VersionType.major,
      '4.1.0-alpha.3',
      'alpha',
      3,
      undefined
    )
    expect(new_version.version_name).toEqual('5.0.0')
    expect(new_version.version_code).toEqual(4)
  })

  it('can bump a PRE-RELEASE version', async () => {
    const new_version = version.update(
      VersionType.pre_release,
      '4.0.0-beta.400',
      'beta',
      400,
      undefined
    )
    expect(new_version.version_name).toEqual('4.0.0-beta.401')
    expect(new_version.version_code).toEqual(401)
  })

  it('can bump to a RELEASE version', async () => {
    const new_version = version.update(
      VersionType.release,
      '4.0.0-beta.400',
      'dev',
      400,
      undefined
    )
    expect(new_version.version_name).toEqual('4.0.0')
    expect(new_version.version_code).toEqual(401)
  })

  it('can bump a pre-release to a RELEASE version', async () => {
    const new_version = version.update(
      VersionType.release,
      '4.0.0-beta.400',
      'beta',
      400,
      undefined
    )
    expect(new_version.version_name).toEqual('4.0.0')
    expect(new_version.version_code).toEqual(401)
  })
})

describe('version updates with properties file', () => {
  const version = new SemanticVersion(
    'myapp.version.name',
    'myapp.version.code'
  )

  beforeEach(() => {
    resetFile()
  })

  afterEach(() => {
    resetFile()
  })

  it('can bump to a PATCH version', () => {
    const new_version = version.update(
      VersionType.patch,
      undefined,
      undefined,
      undefined,
      file_path
    )
    expect(new_version.version_name).toEqual('4.0.1')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a PATCH version', () => {
    const new_version = version.update(
      VersionType.patch,
      undefined,
      undefined,
      undefined,
      pre_file_path
    )
    expect(new_version.version_name).toEqual('4.0.1')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump to a MINOR version', () => {
    const new_version = version.update(
      VersionType.minor,
      undefined,
      undefined,
      undefined,
      file_path
    )
    expect(new_version.version_name).toEqual('4.1.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a MINOR version', () => {
    const new_version = version.update(
      VersionType.minor,
      undefined,
      undefined,
      undefined,
      pre_file_path
    )
    expect(new_version.version_name).toEqual('4.1.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump to a MAJOR version', async () => {
    const new_version = version.update(
      VersionType.major,
      undefined,
      undefined,
      undefined,
      file_path
    )
    expect(new_version.version_name).toEqual('5.0.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a MAJOR version', async () => {
    const new_version = version.update(
      VersionType.major,
      undefined,
      undefined,
      undefined,
      pre_file_path
    )
    expect(new_version.version_name).toEqual('5.0.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a PRE-RELEASE version', async () => {
    const new_version = version.update(
      VersionType.pre_release,
      undefined,
      'beta',
      undefined,
      file_path
    )
    expect(new_version.version_name).toEqual('4.0.0-beta.5')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump to a RELEASE version', async () => {
    const new_version = version.update(
      VersionType.release,
      undefined,
      undefined,
      undefined,
      file_path
    )
    expect(new_version.version_name).toEqual('4.0.0')
    expect(new_version.version_code).toEqual(5)
  })

  it('can bump a pre-release to a RELEASE version', async () => {
    const new_version = version.update(
      VersionType.release,
      undefined,
      undefined,
      undefined,
      pre_file_path
    )
    expect(new_version.version_name).toEqual('4.0.0')
    expect(new_version.version_code).toEqual(5)
  })
})
