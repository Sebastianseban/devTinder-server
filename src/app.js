const express = require("express")

const app = express()

app.use((req,res) => {
    res.send("hello seban")
})

app.listen(3000,()=> "server is ruuning")