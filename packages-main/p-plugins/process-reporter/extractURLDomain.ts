import memoize from "memoizee"
import Url from "url"

function extractURLDomain(urlString: string) {
    const url = Url.parse(urlString);
    if (url.protocol == 'https:' || url.protocol == 'http:') {
        return url.hostname;
    }
    return '';
}

export default memoize(extractURLDomain, { max: 100 })