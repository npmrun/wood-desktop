
https://www.npmjs.com/package/electron-process-reporter?activeTab=readme

<!-- https://www.typescriptlang.org/tsconfig#allowJs -->
软链接会转为真实路径，因此import aa from "@rush/main-process-reporter" 就相当于import aa from "../main-process-reporter/index.js"这种情况
必须定义allowJs，不然无法在ts中导入js