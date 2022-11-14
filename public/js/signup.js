const signup = async (data) => {
  try {
    console.log(data);
    const res = await axios({
      method: "post",
      url: "/signup",
      data,
    });
    alert("Signup successful redirecting to home page");
    window.location.href = "/";
    console.log(res.data);
  } catch (err) {
    console.log(err.response);
  }
};

const form = document.querySelector(".submitButton");
form.addEventListener("click", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;
  signup({ name, email, password, passwordConfirm });
});
