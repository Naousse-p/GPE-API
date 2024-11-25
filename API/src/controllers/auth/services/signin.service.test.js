it("should return userRoles as an empty array if user roles are not defined", async function () {
  const user = {
    _id: "userId",
    email: "test@example.com",
    password: "hashedPassword",
  };
  getOneItem.mockResolvedValue(user);
  bcryptCompareStub.resolves(true);
  generate_token.mockReturnValue("token");
  generate_refresh_token.mockReturnValue("refreshToken");
  const result = await signin_service("test@example.com", "password");
  expect(result).to.include({
    user,
    token: "token",
    refreshToken: "refreshToken",
    userRoles: [],
  });
});
