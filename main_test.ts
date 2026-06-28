import { assertEquals, assertThrows } from "@std/assert";
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
  content: { path: "./index.html", schema: { userType: SchemaType.number, statusDisplay: SchemaType.string} },
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
    content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online"} },
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
    content: { path: "./index.html", data: { userType: "Admin", statusDisplay: "Online"} },
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
  pageBuilder.updateStatic("index", { userType: "Admin", statusDisplay: "Online"});
  assertEquals(
    JSON.stringify(pageBuilder.getVirtualFiles("index")),
    JSON.stringify(indexTrueValue),
  );

  const vFile = pageBuilder.getVirtualFiles("index");
  assertEquals(vFile.content.schema, undefined);

  assertThrows(
    () =>
      pageBuilder.updateDynamic("index2", { SchemaType: SchemaType.number }),
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
    () =>
      pageBuilder.compose({ baseFile: "index", components: ["statusDisplay"] }),
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
