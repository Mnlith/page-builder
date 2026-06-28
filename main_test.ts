import { assert, assertEquals, assertThrows } from "@std/assert";
import { PageBuilder, SchemaType } from "./PageBuilder.ts";

const pageBuilder = new PageBuilder();

const indexTrueValue = {
	name: "index",
	content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online" } },
};
const compObjTrueValue = {
	name: "statusDisplay",
	content: { path: "./index2.html", data: { status: "Online" } },
};
const indexPageTrueValue = `<!DOCTYPE html>
<html>

<body>
    <span>Hello Admin</span>
    <div>
        Online
    </div>
    <script>
        document.addEventListener("userLogOff", () => {
            console.log("Custom 'userLogOff' received!");
        });
    </script>
</body>

</html>`;
const statusPageTrueValue = `<div>
    <span>Online</span>
    <button onclick="send()">Log me off</button>
    <script>
        const send = () => {
            document.addEventListener("sendEvent", () => {
                console.log("Custom 'sendEvent' received!");
            });
        }
    </script>
</div>`;
const composePageTrueValue = `<!DOCTYPE html>
<html>

<body>
    <span>Hello Admin</span>
    <div>
        <div>
    <span>Online</span>
    <button onclick="send()">Log me off</button>
    <script>
        const send = () => {
            document.addEventListener("sendEvent", () => {
                console.log("Custom 'sendEvent' received!");
            });
        }
    </script>
</div>
    </div>
    <script>
        document.addEventListener("userLogOff", () => {
            console.log("Custom 'userLogOff' received!");
        });
    </script>
</body>

</html>`;
const indexStaticUpdatedTrueValue = {
	name: "index",
	content: { path: "./index.html", data: { userType: "User", statusDisplay: "Online" } },
};
const indexDynamicTrueValue = {
	name: "index",
	content: { path: "./index.html", schema: { userType: SchemaType.string, statusDisplay: SchemaType.string } },
};
const indexDynamicTrueValue2 = {
	name: "index",
	content: { path: "./index.html", schema: { userType: SchemaType.number, statusDisplay: SchemaType.string } },
};
const statusDynamicTrueValue = {
	name: "statusDisplay",
	content: { path: "./index2.html", schema: { status: SchemaType.string } },
};

const composeTrueValue = `<!DOCTYPE html>
<html>

<body>
    <span>Hello Admin</span>
    <div>
        <div>
    <span>Online</span>
    <button onclick="send()">Log me off</button>
    <script>
        const send = () => {
            document.addEventListener("sendEvent", () => {
                console.log("Custom 'sendEvent' received!");
            });
        }
    </script>
</div>
    </div>
    <script>
        document.addEventListener("userLogOff", () => {
            console.log("Custom 'userLogOff' received!");
        });
    </script>
</body>

</html>`;

Deno.test("Static test CRUD", () => {
	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online" } },
	});
	const index = pageBuilder.getVirtualFiles("index");
	assertEquals(JSON.stringify(index), JSON.stringify(indexTrueValue));

	pageBuilder.addStatic({
		name: "statusDisplay",
		content: { path: "./index2.html", data: { status: "Online" } },
	});
	const comp = pageBuilder.getVirtualFiles("statusDisplay");
	assertEquals(JSON.stringify(comp), JSON.stringify(compObjTrueValue));

	const indexPage = pageBuilder.build("index");
	assertEquals(indexPage, indexPageTrueValue);

	const statusPage = pageBuilder.build("statusDisplay");
	assertEquals(statusPage, statusPageTrueValue);

	const composedPage = pageBuilder.compose({
		baseFile: "index",
		components: ["statusDisplay"],
	});
	assertEquals(composedPage, composePageTrueValue);

	pageBuilder.updateStatic("index", { userType: "User", statusDisplay: "Online" });
	const indexStaticUpdated = pageBuilder.getVirtualFiles("index");
	assertEquals(indexStaticUpdated, indexStaticUpdatedTrueValue);

	pageBuilder.updateDynamic("index", { userType: SchemaType.string, statusDisplay: SchemaType.string });
	const indexDynamicUpdated = pageBuilder.getVirtualFiles("index");
	assertEquals(
		JSON.stringify(indexDynamicUpdated),
		JSON.stringify(indexDynamicTrueValue),
	);

	pageBuilder.remove("index");
	pageBuilder.remove("statusDisplay");
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);
	assertThrows(
		() => pageBuilder.getVirtualFiles("statusDisplay"),
		Error, // expected error class
		`Error, Could not find the virtualFile for statusDisplay`, // optional expected message substring
	);
});

Deno.test("Dynamic test CRUD", () => {
	pageBuilder.addDynamic({
		name: "index",
		content: { path: "./index.html", schema: { userType: SchemaType.string, statusDisplay: SchemaType.string } },
	});
	const index = pageBuilder.getVirtualFiles("index");
	assertEquals(JSON.stringify(index), JSON.stringify(indexDynamicTrueValue));

	pageBuilder.addDynamic({
		name: "statusDisplay",
		content: { path: "./index2.html", schema: { status: SchemaType.string } },
	});
	const comp = pageBuilder.getVirtualFiles("statusDisplay");
	assertEquals(JSON.stringify(comp), JSON.stringify(statusDynamicTrueValue));

	const indexPage = pageBuilder.build("index", { userType: "Admin", statusDisplay: "Online" });
	assertEquals(indexPage, indexPageTrueValue);

	const statusPage = pageBuilder.build("statusDisplay", { status: "Online" });
	assertEquals(statusPage, statusPageTrueValue);

	const composedPage = pageBuilder.compose({
		baseFile: { name: "index", data: { userType: "Admin" } },
		components: [{ name: "statusDisplay", data: { status: "Online" } }],
	});
	assertEquals(composedPage, composePageTrueValue);

	pageBuilder.updateStatic("index", { userType: "User", statusDisplay: "Online" });
	const indexStaticUpdated = pageBuilder.getVirtualFiles("index");
	assertEquals(indexStaticUpdated, indexStaticUpdatedTrueValue);

	pageBuilder.updateDynamic("index", { userType: SchemaType.string, statusDisplay: SchemaType.string });
	const indexDynamicUpdated = pageBuilder.getVirtualFiles("index");
	assertEquals(
		JSON.stringify(indexDynamicUpdated),
		JSON.stringify(indexDynamicTrueValue),
	);

	pageBuilder.remove("index");
	pageBuilder.remove("statusDisplay");
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);
	assertThrows(
		() => pageBuilder.getVirtualFiles("statusDisplay"),
		Error, // expected error class
		`Error, Could not find the virtualFile for statusDisplay`, // optional expected message substring
	);
});

Deno.test("Error test addStatic", () => {
	// Using this logic because deno test does not want to catch the error even tho it is thrown with the right message.
	let t1 = false;
	try {
		pageBuilder.addStatic({
			name: "index",
			content: { path: "indexx.html", data: { name: "Admin" } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, indexx.html does not exists") {
				t1 = true;
			}
		}
	}
	assertEquals(t1, true);

	let t2 = false;
	try {
		//@ts-ignore
		pageBuilder.addStatic({
			content: { path: "indexx.html", data: { name: "Admin" } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is missing its name") {
				t2 = true;
			}
		}
	}
	assertEquals(t2, true);

	let t3 = false;
	try {
		//@ts-ignore
		pageBuilder.addStatic({
			name: "index",
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, index is missing its content") {
				t3 = true;
			}
		}
	}
	assertEquals(t3, true);

	let t4 = false;
	try {
		pageBuilder.addStatic({
			name: "index",
			//@ts-ignore
			content: { data: { name: "Admin" } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, index is missing its content path") {
				t4 = true;
			}
		}
	}
	assertEquals(t4, true);

	let t5 = false;
	try {
		//@ts-ignore
		pageBuilder.addStatic({});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is missing its name") {
				t5 = true;
			}
		}
	}
	assertEquals(t5, true);

	let t6 = false;
	try {
		//@ts-ignore
		pageBuilder.addStatic();
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is empty") {
				t6 = true;
			}
		}
	}
	assertEquals(t6, true);

	let t7 = false;
	try {
		pageBuilder.addStatic({
			name: "index",
			//@ts-ignore
			content: { path: "./index.html", schema: { name: SchemaType.string } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, you're trying to create a static vitual file named index, and static ones cannot have schema"
			) {
				t7 = true;
			}
		}
	}
	assertEquals(t7, true);

	let t8 = false;
	try {
		pageBuilder.getVirtualFiles("index");
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, Could not find the virtualFile for index"
			) {
				t8 = true;
			}
		}
	}
	assertEquals(t8, true);

	let t9 = false;
	try {
		pageBuilder.addDynamic({
			name: "index",
			content: { path: "./index.html", schema: { name: SchemaType.string } },
		});
		pageBuilder.addDynamic({
			name: "index",
			content: { path: "./index.html", schema: { name: SchemaType.number } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, index already exists"
			) {
				t9 = true;
			}
		}
	}
	assertEquals(t9, true);
	pageBuilder.remove("index");
});

Deno.test("Error test addDynamic", () => {
	// Using this logic because deno test does not want to catch the error even tho it is thrown with the right message.
	let t1 = false;
	try {
		pageBuilder.addDynamic({
			name: "index",
			content: { path: "indexx.html", schema: { name: SchemaType.string } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, indexx.html does not exists") {
				t1 = true;
			}
		}
	}
	assertEquals(t1, true);

	let t2 = false;
	try {
		//@ts-ignore
		pageBuilder.addDynamic({
			content: { path: "indexx.html", schema: { name: SchemaType.string } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is missing its name") {
				t2 = true;
			}
		}
	}
	assertEquals(t2, true);

	let t3 = false;
	try {
		//@ts-ignore
		pageBuilder.addDynamic({
			name: "index",
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, index is missing its content") {
				t3 = true;
			}
		}
	}
	assertEquals(t3, true);

	let t4 = false;
	try {
		pageBuilder.addDynamic({
			name: "index",
			//@ts-ignore
			content: { schema: { name: SchemaType.string } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, index is missing its content path") {
				t4 = true;
			}
		}
	}
	assertEquals(t4, true);

	let t5 = false;
	try {
		//@ts-ignore
		pageBuilder.addDynamic({});
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is missing its name") {
				t5 = true;
			}
		}
	}
	assertEquals(t5, true);

	let t6 = false;
	try {
		//@ts-ignore
		pageBuilder.addDynamic();
	} catch (e) {
		if (e instanceof Error) {
			if (e.message === "Error, your virtual file is empty") {
				t6 = true;
			}
		}
	}
	assertEquals(t6, true);

	let t7 = false;
	try {
		pageBuilder.addDynamic({
			name: "index",
			//@ts-ignore
			content: { path: "./index.html", data: { name: "Admin" } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, you're trying to create a dynamic vitual file named index, and dynamic ones cannot have data"
			) {
				t7 = true;
			}
		}
	}
	assertEquals(t7, true);

	let t8 = false;
	try {
		pageBuilder.getVirtualFiles("index");
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, Could not find the virtualFile for index"
			) {
				t8 = true;
			}
		}
	}
	assertEquals(t8, true);

	let t9 = false;
	try {
		pageBuilder.addDynamic({
			name: "index",
			content: { path: "./index.html", schema: { name: SchemaType.string } },
		});
		pageBuilder.addDynamic({
			name: "index",
			content: { path: "./index.html", schema: { name: SchemaType.number } },
		});
	} catch (e) {
		if (e instanceof Error) {
			if (
				e.message ===
					"Error, index already exists"
			) {
				t9 = true;
			}
		}
	}
	assertEquals(t9, true);
	pageBuilder.remove("index");
});

Deno.test("Error test remove", () => {
	assertThrows(
		() => pageBuilder.remove("index"),
		Error, // expected error class
		`index is not a virtualFile`, // optional expected message substring
	);

	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online" } },
	});

	const _page = pageBuilder.getVirtualFiles("index");
	assertEquals(JSON.stringify(_page), JSON.stringify(indexTrueValue));

	pageBuilder.remove("index");
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);
});

Deno.test("Error test getVirtualFiles", () => {
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);

	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online" } },
	});
	const _vFile = pageBuilder.getVirtualFiles("index");
	assertEquals(JSON.stringify(_vFile), JSON.stringify(indexTrueValue));
	pageBuilder.remove("index");
});

Deno.test("Error test updateStatic", () => {
	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online" } },
	});
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexTrueValue),
	);

	pageBuilder.updateStatic("index", { userType: "User", statusDisplay: "Online" });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexStaticUpdatedTrueValue),
	);
	pageBuilder.updateStatic("index", { userType: "Admin", statusDisplay: "Online" });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexTrueValue),
	);
	pageBuilder.updateDynamic("index", { userType: SchemaType.string, statusDisplay: SchemaType.string });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexDynamicTrueValue),
	);

	const vFile = pageBuilder.getVirtualFiles("index");
	assertEquals(vFile.content.data, undefined);

	assertThrows(
		() => pageBuilder.updateStatic("index2", { SchemaType: SchemaType.number }),
		Error, // expected error class
		`Error, index2 is not a virtualFile`, // optional expected message substring
	);

	pageBuilder.remove("index");
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);
});

Deno.test("Error test updateDynamic", () => {
	pageBuilder.addDynamic({
		name: "index",
		content: { path: "./index.html", schema: { userType: SchemaType.string, statusDisplay: SchemaType.string } },
	});
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexDynamicTrueValue),
	);

	pageBuilder.updateDynamic("index", { userType: SchemaType.number, statusDisplay: SchemaType.string });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexDynamicTrueValue2),
	);
	pageBuilder.updateDynamic("index", { userType: SchemaType.string, statusDisplay: SchemaType.string });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexDynamicTrueValue),
	);
	pageBuilder.updateStatic("index", { userType: "Admin", statusDisplay: "Online" });
	assertEquals(
		JSON.stringify(pageBuilder.getVirtualFiles("index")),
		JSON.stringify(indexTrueValue),
	);

	const vFile = pageBuilder.getVirtualFiles("index");
	assertEquals(vFile.content.schema, undefined);

	assertThrows(
		() => pageBuilder.updateDynamic("index2", { SchemaType: SchemaType.number }),
		Error, // expected error class
		`Error, index2 is not a virtualFile`, // optional expected message substring
	);

	pageBuilder.remove("index");
	assertThrows(
		() => pageBuilder.getVirtualFiles("index"),
		Error, // expected error class
		`Error, Could not find the virtualFile for index`, // optional expected message substring
	);
});

Deno.test("Error test build", () => {
	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin" } },
	});

	pageBuilder.addDynamic({
		name: "statusDisplay",
		content: { path: "./index2.html", schema: { status: SchemaType.string } },
	});

	const comp = pageBuilder.build("statusDisplay", { status: "Online" });
	assertEquals(comp, statusPageTrueValue);

	assertThrows(
		() => pageBuilder.build("statusDisplay"),
		Error, // expected error class
		`Error, statusDisplay is a dynamic virtualFile, you need to pass it a data object corresponding to its schema`, // optional expected message substring
	);

	assertThrows(
		() => pageBuilder.build("statusDisplay", { test: "Online" }),
		Error, // expected error class
		`Error, statusDisplay schema's doesn't correspond the data it received`, // optional expected message substring
	);

	assertThrows(
		() => pageBuilder.build("statusDisplay", { test: "Online", test2: "Online" }),
		Error, // expected error class
		`Error, statusDisplay schema's doesn't correspond the data it received`, // optional expected message substring
	);

	const base = pageBuilder.build("index", { userType: "Admin", statusDisplay: "Online" });
	assertEquals(base, indexPageTrueValue);
	pageBuilder.remove("index");
	pageBuilder.remove("statusDisplay");
});

Deno.test("Error test compose", () => {
	assertThrows(
		() =>
			pageBuilder.compose({
				baseFile: "index",
				components: [{ name: "statusDisplay", data: { status: "Online" } }],
			}),
		Error,
		`Could not find the virtualFile for index`,
	);

	pageBuilder.addStatic({
		name: "index",
		content: { path: "./index.html", data: { userType: "Admin" } },
	});

	assertThrows(
		() =>
			pageBuilder.compose({
				baseFile: "index",
				components: [{ name: "statusDisplay", data: { statusDisplay: "Online" } }],
			}),
		Error,
		`Error, Could not find the virtualFile for statusDisplay`,
	);

	pageBuilder.addDynamic({
		name: "statusDisplay",
		content: { path: "./index2.html", schema: { status: SchemaType.string } },
	});

	assertThrows(
		() => pageBuilder.compose({ baseFile: "index", components: ["statusDisplay"] }),
		Error, // expected error class
		`Error, statusDisplay is a dynamic virtualFile, you need to pass it a data object corresponding to its schema`, // optional expected message substring
	);

	const comp = pageBuilder.compose({
		baseFile: "index",
		components: [{
			name: "statusDisplay",
			data: { status: "Online" },
		}],
	});
	assertEquals(comp, composeTrueValue);

	pageBuilder.updateDynamic("index", {
		userType: SchemaType.string,
		statusDisplay: SchemaType.string,
	});
	const newComp = pageBuilder.compose({
		baseFile: { name: "index", data: { userType: "Admin" } },
		components: [{ name: "statusDisplay", data: { status: "Online" } }],
	});
	assertEquals(newComp, composeTrueValue);
	pageBuilder.remove("index");
	pageBuilder.remove("statusDisplay");
});

// =============================================================================
// Additional tests added after mutation fix + edge cases
// =============================================================================

Deno.test("Mutation regression - compose should not mutate stored virtual files", () => {
	const page = new PageBuilder();

	page.addStatic({
		name: "mutBase",
		content: { path: "./index.html", data: { userType: "Admin" } },
	});
	page.addDynamic({
		name: "mutComp",
		content: { path: "./index2.html", schema: { status: SchemaType.string } },
	});

	// Compose once - this used to mutate the stored virtualFiles[] in-place
	page.compose({
		baseFile: { name: "mutBase", data: { userType: "Admin" } },
		components: [{ name: "mutComp", data: { status: "Online" } }],
	});

	// Now build the base standalone (no args) - stored data must NOT have been polluted
	const standalone = page.build("mutBase");
	assert(typeof standalone === "string" && standalone.includes("#statusDisplay"), "Expected stored static data to remain unmodified after compose()");

	page.remove("mutBase");
	page.remove("mutComp");
});

Deno.test("Multiple consecutive composes are isolated from each other", () => {
	const page = new PageBuilder();

	page.addStatic({
		name: "isolatedBase",
		content: { path: "./index.html", data: { userType: "Guest" } },
	});
	page.addDynamic({
		name: "compA",
		content: { path: "./index2.html", schema: { status: SchemaType.string } },
	});
	page.addDynamic({
		name: "compB",
		content: { path: "./index2.html", schema: { value: SchemaType.number } },
	});

	// First composition with compA / status=Alpha
	const result1 = page.compose({
		baseFile: { name: "isolatedBase", data: { userType: "First" } },
		components: [{ name: "compA", data: { status: "Alpha" } }],
	});

	// Second composition with compB / value=42 (different component, different data)
	const result2 = page.compose({
		baseFile: { name: "isolatedBase", data: { userType: "Second" } },
		components: [{ name: "compB", data: { value: 42 } }],
	});

	// Each result must contain its own baseData values - no cross-contamination
	assert(typeof result1 === "string" && result1.includes("First") && !result1.includes("Second"), "Result 1 should reflect first compose, not second");
	assert(typeof result2 === "string" && result2.includes("Second") && !result2.includes("First"), "Result 2 should reflect second compose, not first");

	page.remove("isolatedBase");
	page.remove("compA");
	page.remove("compB");
});

Deno.test("Compose with an empty components array renders the base as-is", () => {
	const page = new PageBuilder();

	page.addStatic({
		name: "emptyCompBase",
		content: { path: "./index.html", data: { userType: "Nobody" } },
	});

	const result = page.compose({
		baseFile: "emptyCompBase",
		components: [],
	});

	assert(typeof result === "string" && result.includes("Hello Nobody"), "Expected base file to render with its stored data even when no components are provided");

	page.remove("emptyCompBase");
});

Deno.test("Build handles falsy data values (0, false, empty string) correctly", () => {
	const page = new PageBuilder();

	page.addDynamic({
		name: "falsy",
		content: { path: "./falsy.html", schema: { num: SchemaType.number } },
	});

	const htmlNum = page.build("falsy", { num: 0 });
	assert(typeof htmlNum === "string" && htmlNum.includes("0"), "Expected #num to be replaced with '0'");

	// Boolean false - falsy in JS but a perfectly valid data value
	page.addDynamic({
		name: "bool",
		content: { path: "./falsy.html", schema: { active: SchemaType.boolean } },
	});
	const htmlBool = page.build("bool", { active: false });
	assert(typeof htmlBool === "string" && htmlBool.includes("false"), "Expected #active to be replaced with 'false'");

	// Empty string - falsy in JS but a perfectly valid data value
	page.addDynamic({
		name: "emptyStr",
		content: { path: "./falsy.html", schema: { text: SchemaType.string } },
	});
	const htmlEmpty = page.build("emptyStr", { text: "" });
	assert(typeof htmlEmpty === "string" && !htmlEmpty.includes("#text"), "Expected #text to be replaced with empty string (not left as placeholder)");

	page.remove("falsy");
	page.remove("bool");
	page.remove("emptyStr");
});

Deno.test("Build without data on a static file that has no stored data field", () => {
	const page = new PageBuilder();

	// bare.html contains: "<p>No placeholders here.</p>"
	page.addStatic({
		name: "bareFile",
		content: { path: "./bare.html", data: {} },
	});

	// No second argument and no stored data - should not throw, just return raw HTML
	const html = page.build("bareFile");
	assert(typeof html === "string" && html.includes("No placeholders here."), "Expected bare template to render unchanged when no data is available");

	page.remove("bareFile");
});

Deno.test("Schema validation requires exact key match (rejects extra keys)", () => {
	const page = new PageBuilder();

	page.addDynamic({
		name: "schemaExact",
		content: { path: "./switch.html", schema: { name: SchemaType.string } },
	});

	// Passing more keys than the schema defines should throw - length check enforces exact match.
	assertThrows(
		() => page.build("schemaExact", { name: "Alice", age: 30 }),
		Error,
		`Error, schemaExact schema's doesn't correspond the data it received`,
	);

	page.remove("schemaExact");
});

Deno.test("Schema type mismatch throws a descriptive error", () => {
	const page = new PageBuilder();

	page.addDynamic({
		name: "typedMismatch",
		content: { path: "./falsy.html", schema: { count: SchemaType.number } },
	});

	assertThrows(
		() => page.build("typedMismatch", { count: "42" }),
		Error,
		`Error, typedMismatch schema's doesn't correspond the data it received`,
	);

	page.remove("typedMismatch");
});

Deno.test("Dynamic file can be switched to static via updateStatic", () => {
	const page = new PageBuilder();

	page.addDynamic({
		name: "switchToStatic",
		content: { path: "./switch.html", schema: { label: SchemaType.string } },
	});

	// Switch from dynamic to static with fixed data
	page.updateStatic("switchToStatic", { label: "I am now static" });

	// Should build without passing a second argument (uses stored static data)
	const html = page.build("switchToStatic");
	assert(typeof html === "string" && html.includes("I am now static"), "Expected file built from newly-set static data");

	page.remove("switchToStatic");
});

Deno.test("Static file can be switched to dynamic via updateDynamic", () => {
	const page = new PageBuilder();

	page.addStatic({
		name: "switchToDynamic",
		content: { path: "./switch.html", data: { label: "I am now dynamic" } },
	});

	// Switch from static to dynamic with a schema (data is discarded)
	page.updateDynamic("switchToDynamic", { label: SchemaType.string });

	// Now requires data at build time
	const html = page.build("switchToDynamic", { label: "Passed at runtime" });
	assert(typeof html === "string" && html.includes("Passed at runtime"), "Expected file to use dynamically-provided data after type switch");

	page.remove("switchToDynamic");
});
