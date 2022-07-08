function hide()
{
    var x=document.getElementById("password");
    if(x.type=="password")
    {
        x.className="inp";
        x.type="text";
        document.getElementById("hide").className="bi bi-eye-slash";
    }
    else
    {
        x.className="inp";
        x.type="password";
        document.getElementById("hide").className="bi bi-eye"
    }
}