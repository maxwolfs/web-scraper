import Scraper from "../api/Scraper";

const Index = () => {

    const handleClick = () => {
        // setInterval(function () {
            Scraper('https://www.thomann.de/de/behringer_rd_6.htm');
        // }, 20000);
    }

    return (
    <>
    <h1>Hi</h1>
    <button onClick={handleClick}></button>
    </>
    )
}

export default Index;