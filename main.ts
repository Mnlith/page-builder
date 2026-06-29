import { PageBuilder, SchemaType } from "./PageBuilder.ts";
const engine = new PageBuilder();
/*
----  Static exemple  ---------------------------------------------------------------
*/
// Registering static files
engine.addStatic({
	name: "index",
	content: { path: "./index.html", data: { userType: "Admin" } },
});
engine.addStatic({
	name: "statusDisplay",
	content: { path: "./index2.html", data: { status: "Online" } },
});

// Generating the statusDisplay component
const componentFile = engine.build("statusDisplay");
console.log(componentFile);

// Generating base that have in it's html the status display
/* Should auto look for statusDisplay page, change components to components data and only pass
    it as param if there is dynamic files here*/
const baseFile = engine.compose({
	baseFile: "index",
	components: ["statusDisplay"],
});
console.log(baseFile);

engine.remove("index");
engine.remove("statusDisplay");

//------------------------------------------------------------------------------------

/*
----  Dynamic exemple  ---------------------------------------------------------------
*/
// Registering dynamic files
/* On dynamic file since we store data but a schema we need to give the type of all keys (components included)
    Index has a key statusDisplay that we store the component as a string so we describe statusDisplay as string
*/
engine.addDynamic({
	name: "index",
	content: {
		path: "./index.html",
		schema: { userType: SchemaType.string, statusDisplay: SchemaType.string },
	},
});
engine.addDynamic({
	name: "statusDisplay",
	content: { path: "./index2.html", schema: { status: SchemaType.string } },
});

// Generating the statusDisplay component
const componentFile2 = engine.build("statusDisplay", { status: "Online" });
console.log(componentFile2);

// Generating base that have in it's html the status display
/* Since the key statusDisplay will have for value the components, we don't need to pass it as data
    in the baseFile compose will build the components and then place them in the baseFile
*/
const baseFile2 = engine.compose({
	baseFile: { name: "index", data: { userType: "Admin" } },
	components: [{ name: "statusDisplay", data: { status: "Online" } }],
});
console.log(baseFile2);

//------------------------------------------------------------------------------------

/*console.log("START HTML FILE ===========================");
const compose2 = engine.compose({ baseFile: "index", components: ["HelloWorld"] });
console.log(compose2);
console.log("END HTML FILE ===========================");*/

//TODO
/*
Should be able to send unregisted virtualFile do be dynamic
*/
