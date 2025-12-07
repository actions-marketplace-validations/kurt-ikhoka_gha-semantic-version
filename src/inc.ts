export enum Inc {
  /**
   * Indicates that the Version should be incremented by its MAJOR number.
   */
  MAJOR = 'MAJOR',

  /**
   * Indicates that the Version should be incremented by its MINOR number.
   */
  MINOR = 'MINOR',

  /**
   * Indicates that the Version should be incremented by its PATCH number.
   */
  PATCH = 'PATCH',

  /**
   * Indicates that the Version should be incremented by its PRE-RELEASE identifier.
   */
  PRE_RELEASE = 'PRE_RELEASE'
}
