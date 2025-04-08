const fs = require("fs")
const path = require("path")

// 环境变量指定的输出目录
const outputDir = path.resolve(process.cwd(), "extra/build");  // process.env.OUTPUT_DIR || "build/Release"

// 读取 binding.gyp 文件的路径
const bindingGypPath = path.join(__dirname, "../binding.gyp")

// 读取 binding.gyp 文件的内容
fs.readFile(bindingGypPath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading binding.gyp:", err)
        return
    }

    // 修改 product_dir 的值
    const newData = data.replace(/"product_dir": ".*?"/, `"product_dir": "${outputDir}"`)

    // 将修改后的内容写回 binding.gyp 文件
    fs.writeFile(bindingGypPath, newData, "utf8", err => {
        if (err) {
            console.error("Error writing binding.gyp:", err)
        } else {
            console.log(`Updated product_dir to ${outputDir}`)
            // 继续构建过程
        }
    })
})
