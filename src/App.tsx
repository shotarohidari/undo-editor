import { Alert, Box, Button, createTheme, TextField } from "@mui/material"
import { useCallback, useEffect, useState } from "react"

function App() {
  const [text, setText] = useState("");
  const [showAlert,setShowAlert] = useState(false);
  const [hasSaved, setHasSaved] = useState(true);
  const [undoing,setUndoing] = useState(false);
  const [histories,setHistories] = useState<string[]>([]);
  const handleText = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHasSaved(false);
    const {currentTarget:{value}} = e;
    setHistories((histories => [...histories,value]));
    setText(value);
  }
  const saveToLocalStorage = useCallback(() => {
    // ローカルストレージにメモ内容を保存
    localStorage.setItem('memo', text);
    setHasSaved(true);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    },2000);
  }, [text]);
  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    // ショートカットキー押された時
    window.addEventListener("keydown",(e) => {
      const {ctrlKey,key,metaKey} = e;
      if((ctrlKey || metaKey) && key === "z") {
        histories.length > 1 && setUndoing(true);
        setText(histories[histories.length-1]);
        setHistories((histories) => histories.slice(-1));
        setTimeout(() => {
          setUndoing(false)
        },600);
      }
    },{signal})
    return () => {
      controller.abort();
    }
  },[histories]);
  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    // ページを離れるときにローカルストレージに内容保存するか確認
    window.addEventListener("beforeunload",(e) => {
      if(!hasSaved) {
        e.preventDefault();
        // ここでテキスト上書きできない、なぜだ。
        return e.returnValue = "メモが保存されていませんが大丈夫でしょうか？"
      }
    },{signal,capture:true})
    return () => {
      controller.abort();
    }
  }, [hasSaved])
  useEffect(() => {
    // ローカルストレージにデータがあったらそれをメモ内に呼び出す
    const memo = localStorage.getItem('memo');
    memo && setText(memo);
  }, [])

  return (
    <Box>
      {showAlert && <Alert severity="success" sx={{position:"absolute",left:225,width:275}}>保存完了！</Alert>}
      <Box component={"h1"}>メモ帳</Box>
      {undoing && <Box sx={{position:"absolute",left:225,width:275,top:25,fontSize:"30px"}}>Undo</Box>}
      <TextField
        value={text}
        placeholder="ここにメモを入力"
        multiline
        autoFocus
        margin="none"
        sx={{
          width: "800px",
        }}
        rows={15}
        onChange={(e) => handleText(e)}
      />
      <Box mt={2}>
        <Button onClick={() => saveToLocalStorage()} variant="contained">
          メモの内容を恒久的に保存する
        </Button>
      </Box>
    </Box>
  )
}

export default App
