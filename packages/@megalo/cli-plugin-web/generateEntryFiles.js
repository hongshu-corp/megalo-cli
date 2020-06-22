const path = require('path')
const fs = require('fs')

module.exports = function (pagesEntry) {
  const outputPrefix = path.join(process.cwd(), '.megalo-h5-tmp')

  !fs.existsSync(outputPrefix) && fs.mkdirSync(outputPrefix, { recursive: true })

  const routeFilePath = path.join(outputPrefix, 'router.js')
  const entryFilePath = path.join(outputPrefix, 'entry.js')
  const appVuePath = path.join(outputPrefix, 'app.vue')
  const htmlTemplatePath = path.join(outputPrefix, 'index.html')

  // output routeFile, used in spa
  const routeFile = generateRouteFile(pagesEntry)
  fs.writeFileSync(routeFilePath, routeFile, { flag: 'w+' })

  // copy entryFile, used in spa
  !fs.existsSync(entryFilePath) && fs.copyFileSync(path.join(__dirname, './template/entry.js'), entryFilePath)

  // copy app.vue, used in spa
  !fs.existsSync(appVuePath) && fs.copyFileSync(path.join(__dirname, './template/app.vue'), appVuePath)

  // copy index.html, used both in spa and mpa
  !fs.existsSync(htmlTemplatePath) && fs.copyFileSync(path.join(__dirname, './template/index.html'), htmlTemplatePath)
}

function generateRouteFile (pagesEntry) {
  const imports = []; const route = []; const output = []

  imports.push(`import Router from  'vue-router'`, `import Vue from 'vue'`)

  let pageCount = 0
  let componentName
  const pages = Object.entries(pagesEntry)
  for (const [key, value] of pages) {
    pageCount++
    componentName = 'page' + pageCount
    imports.push(`import ${componentName} from '${value.replace(/.js$/, '.vue')}'`)
    route.push(`{ path: '${getPath(key)}', component: ${componentName} }`)
  }

  route.push(`{ path: '/', component: page1 }`)

  output.push(`Vue.use(Router);`, `
        const router = new Router({
            routes 
        })`, `export default router`)

  return `
        ${imports.join('\n')}
            
        const routes = [
        ${route.join(`,\n`)}
        ]    

        ${output.join(`\n`)}
    `
}

// add ’/‘ before route
function getPath (routePath) {
  let newPath = routePath.trim()

  if (!/^\//.test(newPath)) {
    newPath = '/' + newPath
  }

  return newPath
}
