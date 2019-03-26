

export const writeDb = (path, file) => {
    fs.writeFile(path, JSON.stringify(file),'utf8', (err) => {
        if (err) throw err;
    })
}

export const readDb = (path, el) => {
    fs.readFile(path, 'utf8',(err, data) => {
        if (err) throw err;
        el = JSON.parse(data)
    });
    return el;
}