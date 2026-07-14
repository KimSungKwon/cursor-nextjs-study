module.exports = {
  presets: [
    [
      require.resolve("@babel/preset-env"),
      {
        targets: {
          chrome: 100,
        },
      },
    ],
    [
      require.resolve("@babel/preset-react"),
      {
        runtime: "automatic",
      },
    ],
    require.resolve("@babel/preset-typescript"),
  ],
};
