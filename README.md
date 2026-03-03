# Smart csproj Version Grabber

<div align="center">

[![Version](https://img.shields.io/github/package-json/v/Raycynix/get-csproj-version-action?style=for-the-badge)](https://github.com/Raycynix/get-csproj-version-action)

</div>

A lightweight, high-performance GitHub Action that intelligently finds your `.csproj` and extracts its version.
Developed and maintained by **Raycynix**.

## Why Raycynix Version Grabber?

Unlike other "dumb" version extractors, this action follows a smart discovery logic:

1. **Manual Path:** Uses the path you provide (optional).
2. **Solution Discovery:** If no path is given, it finds the `.sln` file and picks the first project defined in it.
3. **Root Discovery:** If no solution is found, it grabs any `.csproj` in the root directory.

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
|   `version`    | "Extracted version (e.g., 1.2.3)"   |
| `project_path` | Full path to the file that was used |

## License

This project is licensed under the [MIT License](https://github.com/Raycynix/get-csproj-version-action/blob/release/LICENSE).
_____
<div align="center">Created with ❤️ by Raycynix</div>>