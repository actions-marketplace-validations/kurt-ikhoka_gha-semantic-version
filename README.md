<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Github Action for Semantic Versioning 2.0.0 updates

This Github action will help increment a given semantic version. It is inspired by the [kotlin-semver](https://github.com/z4kn4fein/kotlin-semver) implementation. 

## Usage

```yaml
uses: kurt-ikhokha/gha-semantic-version@v1.0.1
with:
  version-name: '3.4.0' #required if version-file not provided
  version-name-postfix: 'alpha' #optional postfix to append to the version name
  version-code:  4196 #required if version-file not provided
  update-type: 'patch'. # major, minor, patch, pre-release, release 
  version-file: '<path/to/version.properties file>' # required if version-name and version-code are not provided
  version-code-key: 'version.code' #required if version-file is provided and is the key name for the version code in the provided properties file
  version-name-key: 'version.name' #required if version-file is provided and is the key name for the version name in the provided properties file
```
The `version.properties` file should be in the following format:

```properties
version.name=3.4.0   #required.  If `version-name-key` is provided, then instead of `version.name`, use the value of `version-name-key`
version.code=4196    #required.  If `version-code-key` is provided, then instead of `version.code`, use the value of `version-code-key`
```


Examples
```yaml
       # patch version update
      - name: 'PATCH version update'
        uses: kurt-ikhokha/gha-semantic-version@v1.0.1
        id: patch
        with:
          version-name: '1.0.0'
          version-code:  1
          update-type: 'patch'
      - name: 'Get Patched version'
        run: |
          echo "update"
          echo "Version name: ${{ steps.patch.outputs.new-version-name }}" #1.0.1
          echo "Version code: ${{ steps.patch.outputs.new-version-code }}" #2
     
      # minor version update
      - name: 'MINOR version update'
        uses: kurt-ikhokha/gha-semantic-version@v1.0.1
        id: minor
        with:
          version-name: '1.0.0'
          version-code:  1
          update-type: 'minor'
      - name: 'Get Minored version'
        run: |
          echo "update"
          echo "Version name: ${{ steps.minor.outputs.new-version-name }}" #1.1.0
          echo "Version code: ${{ steps.minor.outputs.new-version-code }}" #2

      # major version update
      - name: 'MAJOR version update'
        uses: kurt-ikhokha/gha-semantic-version@v1.0.1
        id: major
        with:
          version-name: '1.0.0'
          version-code:  1
          update-type: 'major'
      - name: 'Get Majored version'
        run: |
          echo "update"
          echo "Version name: ${{ steps.major.outputs.new-version-name }}" #2.0.0
          echo "Version code: ${{ steps.major.outputs.new-version-code }}" #2
        
      # official version for a pre-release   
      - name: 'PRE-RELEASE version update'
        uses: kurt-ikhokha/gha-semantic-version@v1.0.1
        id: build
        with:
          version-name: '1.0.0-alpha.1'
          version-code:  1
          update-type: 'pre-release'
      - name: 'Get Builded version'
        run: |
          echo "update"
          echo "Version name: ${{ steps.build.outputs.new-version-name }}" #1.0.0-alpha.2
          echo "Version code: ${{ steps.build.outputs.new-version-code }}" #2

       # official version for a pre-release   
      - name: 'RELEASE version update'
        uses: kurt-ikhokha/gha-semantic-version@v1.0.1
        id: build
        with:
          version-name: '1.0.0-alpha.01'
          version-code:  1
          update-type: 'release'
      - name: 'Get Builded version'
        run: |
          echo "update"
          echo "Version name: ${{ steps.build.outputs.new-version-name }}" #1.0.0
          echo "Version code: ${{ steps.build.outputs.new-version-code }}" #1
```



## Contribution

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  

```bash
$ npm install
```

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  

```bash
$ npm test

 PASS  __tests__/semantic-version.test.ts
  version updates without properties file
  ✓ can update a versions patch number (1 ms)
  ✓ can update versions minor number
  ✓ can update versions major number
  ✓ can update a version build
...
```
