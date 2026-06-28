export enum SchemaType {
	string = "string",
	boolean = "boolean",
	number = "number",
}

interface VirtualFile {
	name: string;
	content: {
		path: string;
		data?: { [key: string]: any };
		schema?: { [key: string]: SchemaType };
	};
}

interface StaticVirtualFile {
	name: string;
	content: { path: string; data: { [key: string]: any } };
}

interface DynamicVirtualFile {
	name: string;
	content: { path: string; schema: { [key: string]: SchemaType } };
}

export class PageBuilder {
	private virtualFiles: VirtualFile[];

	constructor() {
		this.virtualFiles = [];
	}

	private checkVFileRequirement = (vFile: VirtualFile) => {
		// No check on data or schema as a user could want to have a baseFile without variable
		if (!vFile) {
			throw new Error(`Error, your virtual file is empty`);
		}
		if (!vFile.name || typeof vFile.name !== "string") {
			throw new Error(`Error, your virtual file is missing its name`);
		}
		if (!vFile.content) {
			throw new Error(`Error, ${vFile.name} is missing its content`);
		}
		if (!vFile.content.path) {
			throw new Error(`Error, ${vFile.name} is missing its content path`);
		}
	};

	private pathExists = (path: string): boolean | Error => {
		try {
			Deno.statSync(path);
			return true;
		} catch (err) {
			if (err instanceof Deno.errors.NotFound) {
				return false;
			}
			throw err; // Throw unexpected errors
		}
	};

	/**
	 * Create a virtual file and add it to the index of virtualFiles
	 * @param name | Name of the virtualFile's creation.
	 * @param content | virtualFile's schema.
	 * @param content.path | Path of the html file.
	 * @param content.data | Data that need to be added to the html file eg: {username: "Admin"} will replace #username in the html when builded.
	 */
	public addStatic(
		data: StaticVirtualFile,
	): void | Error {
		try {
			this.checkVFileRequirement(data);
			const exists = this.pathExists(data.content.path);
			if (!exists) {
				throw new Error(`Error, ${data.content.path} does not exists`);
			}
			if (this.virtualFiles.find((item) => item.name === data.name)) {
				throw new Error(`Error, ${data.name} already exists`);
			}
			//@ts-ignore
			if (data.content.schema) {
				throw new Error(
					`Error, you're trying to create a static vitual file named ${data.name}, and static ones cannot have schema`,
				);
			}
			this.virtualFiles.push(data);
		} catch (e) {
			if (e instanceof Error) {
				throw new Error(e.message as Error["message"]);
			} else {
				throw new Error("Unknown error");
			}
		}
	}

	/**
	 * Create a virtual file and add it to the index of virtualFiles
	 * @param name | Name of the virtualFile's creation.
	 * @param content | virtualFile's schema.
	 * @param content.path | Path of the html file.
	 * @param content.schema | The type of the data that need to be added to the html file eg: {username: SchemaType.string}.
	 */
	public addDynamic(
		data: DynamicVirtualFile,
	): void | Error {
		try {
			this.checkVFileRequirement(data);
			const exists = this.pathExists(data.content.path);
			if (!exists) {
				throw new Error(`Error, ${data.content.path} does not exists`);
			}
			if (this.virtualFiles.find((item) => item.name === data.name)) {
				throw new Error(`Error, ${data.name} already exists`);
			}
			//@ts-ignore
			if (data.content.data) {
				throw new Error(
					`Error, you're trying to create a dynamic vitual file named ${data.name}, and dynamic ones cannot have data`,
				);
			}
			this.virtualFiles.push(data);
		} catch (e) {
			if (e instanceof Error) {
				throw new Error(e.message as Error["message"]);
			} else {
				throw new Error("Unknown error");
			}
		}
	}

	/**
	 * Remove a virtual file from the index of virtualFiles
	 * @param name | Name of the virtualFile's creation.
	 */
	public remove(name: string) {
		const exists = this.virtualFiles.find((item) => item.name === name);
		if (exists) {
			this.virtualFiles = this.virtualFiles.filter((item) => item.name !== name);
		} else {
			throw new Error(`${name} is not a virtualFile`);
		}
	}

	/**
	 * Update a virtual file from the index of virtualFiles to new static data (can also turn a dynamic into static)
	 * @param name | Name of the virtualFile's creation.
	 */
	public updateStatic(
		name: string,
		data: StaticVirtualFile["content"]["data"],
	) {
		const exists = this.virtualFiles.find((item) => item.name === name);
		if (exists) {
			this.virtualFiles = this.virtualFiles.map((item) =>
				item.name === name
					? {
						name: item.name,
						content: { path: item.content.path, data: data },
					}
					: item
			);
		} else {
			throw new Error(`Error, ${name} is not a virtualFile`);
		}
	}

	/**
	 * Update a virtual file from the index of virtualFiles to new dynamic data (can also turn a static into dynamic)
	 * @param name | Name of the virtualFile's creation.
	 */
	public updateDynamic(
		name: string,
		schema: DynamicVirtualFile["content"]["schema"],
	) {
		const exists = this.virtualFiles.find((item) => item.name === name);
		if (exists) {
			this.virtualFiles = this.virtualFiles.map((item) =>
				item.name === name
					? {
						name: item.name,
						content: { path: item.content.path, schema: schema },
					}
					: item
			);
		} else {
			throw new Error(`Error, ${name} is not a virtualFile`);
		}
	}

	/**
	 * Get the virtualFile infos
	 * @param name | virtualFile's name set when .add().
	 */
	public getVirtualFiles(
		name: string,
	): VirtualFile {
		const _exists = this.virtualFiles.find((item) => item.name === name);
		if (!_exists) {
			throw new Error(`Error, Could not find the virtualFile for ${name}`);
		}
		return _exists;
	}

	/**
	 * Build the page as string should not be used it the page has component, use compose.
	 * @param name | virtualFile's name set when .add().
	 */
	public build(name: string, data?: any): string | Error {
		try {
			const vFile = this.getVirtualFiles(name);
			// load file
			const file = Deno.readTextFileSync(vFile.content.path);
			let builtHtml = file;
			if (vFile.content.schema) {
				if (!data) {
					throw new Error(
						`Error, ${name} is a dynamic virtualFile, you need to pass it a data object corresponding to its schema`,
					);
				}
				const checkDataValidity = (schema: any, data: any) => {
					const schemaKeys = Object.keys(schema);
					const dataKeys = Object.keys(data);

					if (schemaKeys.length !== dataKeys.length) {
						throw new Error(
							`Error, ${name} schema's doesn't correspond the data it received`,
						);
					}

					let validity = true;
					for (const element of schemaKeys) {
						if (typeof data[element] !== schema[element]) {
							validity = false;
						}
					}
					if (!validity) {
						throw new Error(
							`Error, ${name} schema's doesn't correspond the data it received`,
						);
					}
				};
				checkDataValidity(vFile.content.schema, data);
			}
			Object.entries(data ? data : vFile.content.data).forEach(
				([key, value]) => {
					builtHtml = builtHtml.replaceAll(`#${key}`, String(value));
				},
			);
			return builtHtml;
		} catch (e) {
			if (e instanceof Error) {
				throw new Error(e.message as Error["message"]);
			} else {
				throw new Error(`Could not build ${name} virutalFile not found`);
			}
		}
	}

	/**
	 * Build a layer 2 html file by merging to the baseFile the components.
	 * All the files needs to be registered as virtualFiles to be found
	 * You need to put the components as value is the baseFile for it to works, it's sort of glorified
	 * replaceAll()
	 * @param baseFile | Name of the parent virtualFile.
	 * @param components | Arrays of names of the components virtualFile.
	 */
	public compose(
		{ baseFile, components }: {
			baseFile: string | { name: string; data: any };
			components: (string | { name: string; data: any })[];
		},
	): string | Error {
		try {
			// Get files to check that they exists
			const vFile = (() => {
				const _static = typeof baseFile === "string";
				const _name = _static ? baseFile : baseFile.name;
				// Create a shallow copy to avoid mutating the stored virtual file
				return { ...this.getVirtualFiles(_name) };
			})();

			// Use local variables instead of mutating stored virtual files
			let baseData: any = typeof baseFile === "string" ? vFile.content.data : baseFile.data;

			const compVFile = components.map((item) => {
				const _static = typeof item === "string";
				const _name = _static ? item : item.name;
				// Create a shallow copy to avoid mutating the stored virtual file
				const _vFile = { ...this.getVirtualFiles(_name) };
				if (!_static) {
					_vFile.content.data = components.filter((item) => typeof item !== "string").find((component) => component.name === _name)!.data;
				}
				return _vFile;
			});

			// Create the file as string
			// First the components
			const componentsData = compVFile.map((item) => {
				const result = this.build(item.name, item.content.data);
				return { [item.name]: result };
			});

			// Merge component results into base data (local only)
			baseData = {
				...baseData,
				...Object.assign({}, ...componentsData),
			};

			// Then create the baseFile string
			const builtHtml = this.build(vFile.name, baseData);
			if (builtHtml instanceof Error) throw builtHtml;

			// Resolve any remaining dynamic component placeholders recursively (multi-level nesting)
			return this.resolveComponents(builtHtml, new Set([vFile.name]));
		} catch (e) {
			if (e instanceof Error) {
				throw new Error(
					e.message as Error["message"],
				);
			} else {
				throw new Error("Error Could not build");
			}
		}
	}

	/**
	 * Recursively resolve dynamic component placeholders found in rendered HTML.
	 * Enables multi-level nesting (A → B → C where each references the next).
	 * Detects cycles to prevent infinite loops.
	 */
	private resolveComponents(
		html: string,
		inProgress: Set<string>,
	): string {
		return html.replace(/#(\w+)/g, (_fullMatch, placeholderName) => {
			// Cycle detection: skip if already being processed in this resolution chain
			if (inProgress.has(placeholderName)) return _fullMatch;

			// Only resolve registered dynamic virtual files (skip static / unknown placeholders)
			let vFile;
			try {
				vFile = this.getVirtualFiles(placeholderName);
			} catch {
				return _fullMatch; // Not a registered VFile — leave as-is
			}
			if (!vFile || !vFile.content.schema) return _fullMatch;

			inProgress.add(placeholderName);

			try {
				// Build the nested component and recursively resolve its own placeholders too
				const resolvedContent = this.build(placeholderName, vFile.content.data);
				if (resolvedContent instanceof Error) throw resolvedContent;

				const fullyResolved = this.resolveComponents(
					resolvedContent,
					new Set(inProgress),
				);

				inProgress.delete(placeholderName);
				return String(fullyResolved);
			} catch {
				// Build fails (e.g. missing dynamic data) → leave the placeholder as-is
				inProgress.delete(placeholderName);
				return _fullMatch;
			}
		});
	}
}
