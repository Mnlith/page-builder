# Page Builder — Documentation

A **Deno-based HTML template engine** that manages virtual files (HTML templates) with two rendering modes — static and dynamic — plus a composition system for building pages from reusable components.
Project made in late 2025 to simply tinker a small page builder engine to go inside an http server.
The main idea was to craft something that could create dynamic componenent for a small project.
Also, the doc has been made by my local clanker, I hate doing those.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
  - [Virtual Files](#virtual-files)
  - [Static vs Dynamic](#static-vs-dynamic)
  - [Template Placeholders](#template-placeholders)
- [API Reference](#api-reference)
  - [SchemaType Enum](#schematype-enum)
  - [PageBuilder Class](#pagebuilder-class)
- [Usage Examples](#usage-examples)
  - [Static Virtual Files](#static-virtual-files)
  - [Dynamic Virtual Files](#dynamic-virtual-files)
  - [Composing Pages from Components](#composing-pages-from-components)
- [Architecture Overview](#architecture-overview)

---

## Getting Started

```ts
import { PageBuilder, SchemaType } from "./PageBuilder.ts";

const engine = new PageBuilder();
```

Create a `PageBuilder` instance. This is your template registry and rendering engine. All operations go through this object.

> **Note:** This library runs exclusively in Deno. It uses `Deno.statSync` and `Deno.readTextFileSync` internally.

---

## Core Concepts

### Virtual Files

A **virtual file** is a registered HTML template. It consists of:

| Property | Type | Description |
|---|---|---|
| `name` | `string` | Unique identifier used to reference the template |
| `content.path` | `string` | Filesystem path to the `.html` file |
| `content.data` (optional) | `{ [key: string]: any }` | Pre-provided values for static templates |
| `content.schema` (optional) | `{ [key: string]: SchemaType }` | Type schema for dynamic template data |

Virtual files are stored in an internal index (`virtualFiles[]`) and referenced by their `name`.

### Static vs Dynamic

| Aspect | Static | Dynamic |
|---|---|---|
| Registration method | `addStatic()` | `addDynamic()` |
| Data | Provided at registration time | Provided at build time (validated against schema) |
| Schema | Not allowed | Required — defines expected data keys and types |
| Use case | Templates with fixed, unchanging values | Reusable templates where data varies per render |

You can switch a virtual file between static and dynamic using `updateStatic()` / `updateDynamic()`.

### Template Placeholders

Templates use simple placeholder syntax: `#keyname` is replaced with the corresponding value from the data object. All values are converted to strings via `String(value)`.

```html
<!-- index.html -->
<h1>Welcome, #userType</h1>
<div>#statusDisplay</div>
```

When built with `{ userType: "Admin", statusDisplay: "<p>Online</p>" }`, the output becomes:

```html
<h1>Welcome, Admin</h1>
<div><p>Online</p></div>
```

---

## API Reference

### SchemaType Enum

Used to define expected data types for dynamic virtual files.

| Value | Description | JavaScript type checked against |
|---|---|---|
| `SchemaType.string` | Text values | `"string"` |
| `SchemaType.boolean` | Boolean values | `"boolean"` |
| `SchemaType.number` | Numeric values | `"number"` |

### PageBuilder Class

#### `addStatic(data: StaticVirtualFile): void`

Registers a static virtual file. The file's path must exist on disk, and its data is fixed at registration time.

**Parameters:**
```ts
{
  name: string;                        // Unique identifier
  content: {
    path: string;                      // Filesystem path to .html file
    data: { [key: string]: any };      // Fixed placeholder values
  }
}
```

#### `addDynamic(data: DynamicVirtualFile): void`

Registers a dynamic virtual file. A schema defines what keys and types the build-time data must have. Data is provided when calling `build()` or `compose()`.

**Parameters:**
```ts
{
  name: string;                        // Unique identifier
  content: {
    path: string;                      // Filesystem path to .html file
    schema: { [key: string]: SchemaType }; // Type definitions for placeholders
  }
}
```

#### `remove(name: string): void`

Removes a registered virtual file by name. Throws if the name does not exist.

#### `updateStatic(name: string, data: { [key: string]: any }): void`

Converts or updates a virtual file to static mode with new fixed data.

#### `updateDynamic(name: string, schema: { [key: string]: SchemaType }): void`

Converts or updates a virtual file to dynamic mode with a new schema.

#### `getVirtualFiles(name: string): VirtualFile`

Returns the registered metadata for a virtual file by name. Throws if not found.

#### `build(name: string, data?: any): string`

Renders a single template by replacing all `#key` placeholders with values from `data`.

- **Static files:** Use pre-registered `content.data` if no `data` argument is provided.
- **Dynamic files:** `data` is required and validated against the file's schema (keys must match exactly, types are checked).

Throws if:
- The virtual file does not exist
- A dynamic file receives no data or invalid data types
- The template file cannot be read from disk

#### `compose({ baseFile, components }): string`

Builds a full page by composing one base template with zero or more component templates.

**How it works:**

1. Each component is built independently via `build()`
2. Rendered HTML strings are mapped to their component names (e.g., `{ statusDisplay: "<p>Online</p>" }`)
3. These values are merged into the base file's data object
4. The base template is rendered, replacing any placeholders that match component names

**Parameters:**
```ts
{
  baseFile: string | { name: string; data: any };  // Base template reference + optional data
  components: (string | { name: string; data: any })[];  // Component references + optional data
}
```

Each item can be either a **string** (just the name, no custom data) or an **object** with `name` and `data`.

Throws if any referenced virtual file does not exist.

---

## Usage Examples

### Static Virtual Files

```ts
engine.addStatic({
  name: "statusDisplay",
  content: { path: "./index2.html", data: { status: "Online" } },
});

const html = engine.build("statusDisplay");
// Reads ./index2.html, replaces #status with "Online"

engine.remove("statusDisplay"); // Cleanup
```

### Dynamic Virtual Files

```ts
engine.addDynamic({
  name: "statusDisplay",
  content: { path: "./index2.html", schema: { status: SchemaType.string } },
});

const html = engine.build("statusDisplay", { status: "Online" });
// Validates that data has exactly one key 'status' of type string, then renders
```

### Composing Pages from Components

```ts
engine.addStatic({
  name: "index",
  content: { path: "./index.html", data: { userType: "Admin" } },
});

engine.addDynamic({
  name: "statusDisplay",
  content: { path: "./index2.html", schema: { status: SchemaType.string } },
});

const html = engine.compose({
  baseFile: { name: "index", data: { userType: "Admin" } },
  components: [{ name: "statusDisplay", data: { status: "Online" } }],
});
// 1. Renders statusDisplay → "<p>Online</p>" (for example)
// 2. Merges into base data: { userType: "Admin", statusDisplay: "<p>Online</p>" }
// 3. Renders index.html replacing both #userType and #statusDisplay
```

---

## Architecture Overview

```
┌───────────────────────────────────────────┐
│              PageBuilder                  │
│                                           │
│  ┌─────────────┐  ┌─────────────┐         │
│  │  addStatic()│  │ addDynamic()│         │
│  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │
│         ▼                ▼                │
│   virtualFiles[] (internal index)         │
│                                           │
│  ┌──────────────┐                         │
│  │   build()    │  ← replaces #key with   │
│  │              │     data values         │
│  └──────┬───────┘                         │
│         │                                 │
│         ▼                                 │
│  ┌──────────────┐                         │
│  │   compose()  │  ← builds components,   │
│  │              │     injects into base   │
│  └──────────────┘                         │
└───────────────────────────────────────────┘
```

### Data Flow (Static)

```
addStatic({ path: "./template.html", data: { name: "Alice" } })
  → stored in virtualFiles[]
  → build("template")
    → reads template.html
    → replaces #name with "Alice"
    → returns rendered string
```

### Data Flow (Dynamic)

```
addDynamic({ path: "./template.html", schema: { name: SchemaType.string } })
  → stored in virtualFiles[]
  → build("template", { name: "Alice" })
    → validates data matches schema (keys + types)
    → reads template.html
    → replaces #name with "Alice"
    → returns rendered string
```

### Data Flow (Compose)

```
compose({ baseFile: ..., components: [...] })
  │
  ├── For each component:
  │     build(component.name, component.data)
  │       → renders component HTML string
  │
  ├── Merge rendered strings into base data by component name
  │     e.g., { userType: "Admin", statusDisplay: "<div>...</div>" }
  │
  └── build(baseFile.name, mergedData)
        → renders final composed page
```

---

## Error Handling

All methods throw `Error` on failure. Common error conditions:

| Condition | Affected Methods |
|---|---|
| Virtual file does not exist | `build()`, `compose()`, `remove()`, `getVirtualFiles()` |
| Template file path not found on disk | `addStatic()`, `addDynamic()` |
| Duplicate name registration | `addStatic()`, `addDynamic()` |
| Schema mismatch (wrong keys or types) | `build()` for dynamic files |
| Static file with schema / Dynamic file with data | `addStatic()`, `addDynamic()` |
