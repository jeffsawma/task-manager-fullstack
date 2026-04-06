GG Hiver

TEST ENDPOINT:

app.get("/", (req, res) => {
    console.log(req);
    //res.send('<h1>some html</h1>');
    return res.json({
        message: "Bonjour!"
    });
});

app.post("/test", (req, res) => {
    return res.json({
        message: "Test works!",
        data: {
            ok: true,
            age: 44
        }
    });
});

LISTEN APP.JS

// app.listen(5000, () => {
//     console.log("Server running....");
// });
