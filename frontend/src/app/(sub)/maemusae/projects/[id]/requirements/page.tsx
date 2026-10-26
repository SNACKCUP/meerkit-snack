import View from "./view";

// 데모 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
