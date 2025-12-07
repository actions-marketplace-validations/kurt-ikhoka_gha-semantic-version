import {PreRelease} from './pre-release'
import {Inc} from './inc'

const NUMERIC = '0|[1-9]\\d*'

// Alphanumeric or hyphen pattern.
const ALPHANUMERIC_OR_HYPHEN = '[0-9a-zA-Z-]'

// Letter or hyphen pattern.
const LETTER_OR_HYPHEN = '[a-zA-Z-]'

// Non-numeric identifier pattern. (used for parsing pre-release)
const NON_NUMERIC = `\\d*${LETTER_OR_HYPHEN}${ALPHANUMERIC_OR_HYPHEN}*`

// Dot-separated numeric identifier pattern. (<major>.<minor>.<patch>)
const CORE_VERSION = `(${NUMERIC})\\.(${NUMERIC})\\.(${NUMERIC})`

// Dot-separated loose numeric identifier pattern. (<major>(.<minor>)?(.<patch>)?)
const LOOSE_CORE_VERSION = `(${NUMERIC})(?:\\.(${NUMERIC}))?(?:\\.(${NUMERIC}))?`

// Numeric or non-numeric pre-release part pattern.
const PRE_RELEASE_PART = `(?:${NUMERIC}|${NON_NUMERIC})`

// Pre-release identifier pattern. A hyphen followed by dot-separated
// numeric or non-numeric pre-release parts.
const PRE_RELEASE = `(?:-(${PRE_RELEASE_PART}(?:\\.${PRE_RELEASE_PART})*))`

// Build-metadata identifier pattern. A + sign followed by dot-separated
// alphanumeric build-metadata parts.
const BUILD = `(?:\\+(${ALPHANUMERIC_OR_HYPHEN}+(?:\\.${ALPHANUMERIC_OR_HYPHEN}+)*))`

// List of allowed operations in a condition.
// Numeric identifier pattern for parsing conditions.
// X-RANGE version: 1.x | 1.2.* | 1.1.X
// Pattern that only matches numbers.
// Pattern that only matches alphanumeric or hyphen characters.
// Version parsing pattern: 1.2.3-alpha+build
const VERSION_REGEX = `^${CORE_VERSION}${PRE_RELEASE}?${BUILD}?$`

// Prefixed version parsing pattern: v1.2-alpha+build
const LOOSE_VERSION_REGEX = `^v?${LOOSE_CORE_VERSION}${PRE_RELEASE}?${BUILD}?$`

// Operator condition: >=1.2.*
// Hyphen range condition: 1.2.* - 2.0.0
export class Version {
  private static readonly versionRegex: RegExp = new RegExp(VERSION_REGEX)
  private static readonly looseVersionRegex: RegExp = new RegExp(
    LOOSE_VERSION_REGEX
  )

  static readonly min: Version = new Version()

  private constructor(
    readonly major: number = 0,
    readonly minor: number = 0,
    readonly patch: number = 0,
    private parsedPreRelease?: PreRelease,
    readonly buildMetadata?: string
  ) {
    if (major < 0) throw new Error('The major number must be >= 0.')
    if (minor < 0) throw new Error('The minor number must be >= 0.')
    if (patch < 0) throw new Error('The patch number must be >= 0.')
  }

  static create(
    major = 0,
    minor = 0,
    patch = 0,
    preRelease?: string,
    buildMetadata?: string
  ): Version {
    return new Version(
      major,
      minor,
      patch,
      preRelease ? PreRelease.create(preRelease) : undefined,
      buildMetadata
    )
  }

  get preRelease(): string | undefined {
    return this.parsedPreRelease?.toString()
  }

  get isPreRelease(): boolean {
    return this.parsedPreRelease !== undefined
  }

  get isStable(): boolean {
    return this.major > 0 && this.parsedPreRelease === undefined
  }

  copy(
    major: number = this.major,
    minor: number = this.minor,
    patch: number = this.patch,
    preRelease: string | undefined = this.preRelease,
    buildMetadata: string | undefined = this.buildMetadata
  ): Version {
    return Version.create(major, minor, patch, preRelease, buildMetadata)
  }

  compareTo(other: Version): number {
    if (this.major !== other.major) {
      return this.major - other.major
    } else if (this.minor !== other.minor) {
      return this.minor - other.minor
    } else if (this.patch !== other.patch) {
      return this.patch - other.patch
    } else if (this.parsedPreRelease && !other.parsedPreRelease) {
      return -1
    } else if (!this.parsedPreRelease && other.parsedPreRelease) {
      return 1
    } else if (this.parsedPreRelease && other.parsedPreRelease) {
      return this.parsedPreRelease.compare(other.parsedPreRelease)
    } else {
      return 0
    }
  }

  nextMajor(preRelease?: string): Version {
    const pr = preRelease ? PreRelease.create(preRelease) : undefined
    return new Version(this.major + 1, 0, 0, pr)
  }

  nextMinor(preRelease?: string): Version {
    const pr = preRelease ? PreRelease.create(preRelease) : undefined
    return new Version(this.major, this.minor + 1, 0, pr)
  }

  nextPatch(preRelease?: string): Version {
    const pr = preRelease ? PreRelease.create(preRelease) : undefined
    return new Version(this.major, this.minor, this.patch + 1, pr)
  }

  nextPreRelease(preRelease?: string): Version {
    const patchNumber = this.preRelease != null ? this.patch : this.patch + 1
    const preReleaseIdentity = preRelease || this.incrementPreRelease()
    const pr = preReleaseIdentity
      ? PreRelease.create(preReleaseIdentity)
      : undefined
    return new Version(this.major, this.minor, patchNumber, pr)
  }

  // This is just an example, you need to implement this according to your requirements.
  incrementPreRelease(): string {
    return `${this.preRelease}.1`
  }

  // Assumption: Inc is an object with MAJOR, MINOR, PATCH, PRE_RELEASE as properties.
  inc(by: string, preRelease?: string): Version {
    switch (by) {
      case Inc.MAJOR:
        return this.nextMajor(preRelease)
      case Inc.MINOR:
        return this.nextMinor(preRelease)
      case Inc.PATCH:
        return this.nextPatch(preRelease)
      case Inc.PRE_RELEASE:
        return this.nextPreRelease(preRelease)
      default:
        return this // return current version as default
    }
  }

  withoutSuffixes(): Version {
    return new Version(this.major, this.minor, this.patch)
  }

  equals(other: Version): boolean {
    return this.compareTo(other) === 0
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}${
      this.parsedPreRelease ? `-${this.parsedPreRelease}` : ''
    }${this.buildMetadata ? `+${this.buildMetadata}` : ''}`
  }

  static parse(versionString: string, strict = true): Version {
    const regex = strict ? this.versionRegex : this.looseVersionRegex
    const result = regex.exec(versionString)
    if (!result) throw new Error(`Invalid version: ${versionString}`)
    const major = parseInt(result[1]) || 0
    const minor = parseInt(result[2]) || 0
    const patch = parseInt(result[3]) || 0
    const preRelease = result[4]
    const buildMetadata = result[5]

    if (!strict && isNaN(major)) {
      throw new Error(`Invalid version: ${versionString}`)
    }

    return Version.create(major, minor, patch, preRelease, buildMetadata)
  }
}
