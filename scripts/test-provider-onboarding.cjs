const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const test = require("node:test");
const assert = require("node:assert/strict");
function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file,"utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const mod = { exports: {} };
  new Function("require","module","exports",code)(name => name.startsWith("@/") ? load(path.join("src",name.slice(2)+".ts")) : require(name),mod,mod.exports);
  return mod.exports;
}
const { validateOnboarding } = load("src/lib/provider-onboarding.ts");
const { authDestination } = load("src/lib/auth-destination.ts");
const valid = () => ({ id: "54dbecc5-28c8-45ca-977a-02774b8798f8", confirmed:true, draft: {
 name:"Sample Practice",city:"Bengaluru",description:"A sample practice offering guided everyday movement sessions.",
 offer:"Mobility introduction",audience:"Desk workers",contact:"Sample Provider",email:"preview@example.com",phone:"",
 price:"",credentials:"",format:"Online",category:"Trainer"
}});
test("optional pricing and credentials do not block publishing", () => assert.equal(validateOnboarding(valid()).ok,true));
test("missing confirmation cannot publish", () => { const b=valid();b.confirmed=false;assert.equal(validateOnboarding(b).ok,false); });
test("whitespace profiles and malformed emails are rejected", () => {
 for (const [field,value] of [["name","   "],["email","not-an-email"],["description","short"]]) {
 const b=valid();b.draft[field]=value;assert.equal(validateOnboarding(b).ok,false); }
});
test("extra owner and score fields are never forwarded to the database", () => {
 const b=valid();b.draft.owner_id="attacker";b.draft.wrs_score=100;
 const r=validateOnboarding(b);assert.equal(r.ok,true);
 assert.equal(r.draft.owner_id,undefined);assert.equal(r.draft.wrs_score,undefined);
});
test("invalid categories, identifiers and oversized text are rejected", () => {
 const b=valid();b.draft.category="Administrator";assert.equal(validateOnboarding(b).ok,false);
 b.draft.category="Resort";b.id="not-a-uuid";assert.equal(validateOnboarding(b).ok,false);
 const c=valid();c.draft.credentials="x".repeat(501);assert.equal(validateOnboarding(c).ok,false);
});
test("null and malformed requests are safe", () => {
 for (const b of [null, [], "", {draft:null}]) assert.equal(validateOnboarding(b).ok,false);
});
test("onboarding redirect remains internal", () => {
 assert.equal(authDestination("/provider/onboarding"),"/provider/onboarding");
 for (const url of ["https://evil.example/provider/onboarding","//evil.example","/admin/reports/krafton"]) assert.equal(authDestination(url),undefined);
});
