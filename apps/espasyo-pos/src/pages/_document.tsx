import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const nonce = (ctx.req?.headers["x-nonce"] as string) ?? "";
    return { ...initialProps, nonce };
  }

  render() {
    const { nonce } = this.props as typeof this.props & { nonce?: string };
    return (
      <Html lang="en">
        <Head nonce={nonce} />
        <body className="antialiased">
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}
