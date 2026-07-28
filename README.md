<div align="center">

# Smart csproj Version Grabber

[![Version](https://img.shields.io/github/package-json/v/Raycynix/get-csproj-version-action?style=for-the-badge)](https://github.com/raycynix-official/get-csproj-version-action)

</div>

A lightweight, high-performance GitHub Action that intelligently finds your `.csproj` and extracts its version from the project file or `Directory.Build.props`.

> <div align="center">Developed and Maintained by <b>Raycynix</b> </div>

## Why Raycynix Version Grabber?

Unlike other "dumb" version extractors, this action follows a smart discovery logic:

1. **Manual Path:** Uses the path you provide (optional).
2. **Solution Discovery:** If no path is given, it finds the `.sln` file and picks the first project defined in it.
3. **Root Discovery:** If no solution is found, it grabs any `.csproj` in the root directory.
4. **Central Version Discovery:** If the selected `.csproj` has no version, it searches upward from the project directory and reads the nearest `Directory.Build.props`.

> [!IMPORTANT]
> If you have **multiple projects**, providing a manual path is `recommended`.

Version properties are checked in this order: `Version`, `PackageVersion`, then `AssemblyVersion`. A value in the `.csproj` takes precedence over `Directory.Build.props`.

## Usage

```yaml
- name: Get Project Version
  id: get_version
  uses: Raycynix/get-csproj-version-action@v1
  with:
    # Optional: path to your specific .csproj
    path: './src/MyProject/MyProject.csproj'

- name: Use Version
  run: |
    echo "Version: ${{ steps.get_version.outputs.version }}"
    echo "Project: ${{ steps.get_version.outputs.project_path }}"
```

## Inputs

| **Name** |          **Description**          | **Required** | **Default** |
|:--------:|:---------------------------------:|:------------:|:-----------:|
|  `path`  | Manual path to the `.csproj` file |      No      |     ""      |

## Outputs

|   **Output**   | **Description**                     |
|:--------------:|:------------------------------------|
|   `version`    | Extracted version (e.g., `1.2.3`)   |
| `project_path` | Path to the selected `.csproj` file |

## Using Directory.Build.props

The action supports centrally managed versions. For example:

```xml
<!-- Directory.Build.props -->
<Project>
  <PropertyGroup>
    <Version>1.2.0</Version>
  </PropertyGroup>
</Project>
```

```xml
<!-- src/MyProject/MyProject.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
</Project>
```

When `MyProject.csproj` is selected, the action returns `1.2.0`. It follows the same nearest-file convention as MSBuild: the first `Directory.Build.props` found while walking up from the project directory is used.

## License

This project is licensed under the [MIT License](https://github.com/Raycynix/get-csproj-version-action/blob/release/LICENSE).
_____
<div align="center"> Created with ❤️ by <b>Raycynix</b></div>
