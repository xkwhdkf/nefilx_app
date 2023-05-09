import React, { useEffect } from 'react'

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) =>{
      if(!ref.current || ref.current.contains(e.target)){
        return;
      } else {
        handler()
      }
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
  },[ref, handler])
}

export default useOnClickOutside