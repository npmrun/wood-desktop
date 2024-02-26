const allModules = import.meta.glob("./*/index.vue", { eager: true })

export const moduleArray: any[] = []

for (const key in allModules) {
    const m = allModules[key] as any
    const mod = m.default || m
    moduleArray.push(mod)
}

console.log(moduleArray);

export {
    allModules,
}