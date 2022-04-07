export const handleOnlyNumber = ((e) => {
    const x = e.which || e.keycode;
    if (!(x >= 48 && x <= 57)) e.preventDefault();
    if (e.target.value.length > 14) e.preventDefault();
  });