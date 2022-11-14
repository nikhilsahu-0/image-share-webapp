const login = async (data) => {
  try {
    console.log(data);
    const res = await axios({
      method: "post",
      url: "/login",
      data,
    });
    alert("Login successful redirecting to home page");
    window.location.href = "/";
    console.log(res.data);
  } catch (err) {
    console.log(err.response);
  }
};

const form = document.querySelector(".submitButton");
form.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login({ email, password });
});
