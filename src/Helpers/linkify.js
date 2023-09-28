const SCHEME = "[a-z\\d.-]+://",
    IPV4 = "(?:(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
    HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
    TLD = `(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|
    bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch
    |ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|
    es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu
    |gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke
    |kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil
    |mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni
    |nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru
    |rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|
    tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws
    |xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|
    xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|
    zm|zw)`,
    HOST_OR_IP = "(?:" + HOSTNAME + TLD + "|" + IPV4 + ")",
    PATH = "(?:[;/][^#?<>\\s]*)?",
    QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
    URI1 = `\\b${SCHEME}[^<>\\s]{8,}`,
    URI2 = `\\b${HOST_OR_IP}${PATH}${QUERY_FRAG}(?!\\w)`,
    MAILTO = "mailto:",
    EMAIL = `(?:${MAILTO})?[a-z\\d!#$%&'*+/=?^_\`{|}~-]+(?:\\.[a-z\\d!#$%&'*+/=?^_\`{|}~-]+)*@${HOST_OR_IP}${QUERY_FRAG}(?!\\w)`,
    URI_RE = new RegExp(`(?:${URI1}|${URI2}|${EMAIL})`, "ig"),
    SCHEME_RE = new RegExp("^" + SCHEME, "i"),

    quotes = {
        "'": "`",
        '>': '<',
        ')': '(',
        ']': '[',
        '}': '{',
        '»': '«',
        '›': '‹'
    }

let default_options = {
    callback: function (text, href) {
        return href ? '<a class="link" target="_blank" href="' + href + '" title="' + href + '">' + text + '</a>' : text;
    },
    punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
};
const linkifyCommon = (href = "") => {
    if (href.indexOf('@') !== -1) {
        return (!href.indexOf(MAILTO) ? '' : MAILTO)
    } else if (!href.indexOf('irc.')) {
        return 'irc://'
    }
    return !href.indexOf('ftp.') ? 'ftp://' : 'http://'
}
export default function linkify(txt, options) {
    options = options || {};
    let arr,
        i,
        link,
        href,
        html = '',
        parts = [],
        idx_prev,
        idx_last,
        idx,
        link_last,
        matches_begin,
        matches_end,
        quote_begin,
        quote_end;

    for (i in default_options) {
        if (options[i] === undefined) {
            options[i] = default_options[i];
        }
    }
    //NOSONAR
    while (arr = URI_RE.exec(txt)) {

        link = arr[0];
        idx_last = URI_RE.lastIndex;
        idx = idx_last - link.length;
        if (/[\/:]/.test(txt.charAt(idx - 1))) {
            continue;
        }
        do {
            link_last = link;
            quote_end = link.substring(-1);
            quote_begin = quotes[quote_end];
            if (quote_begin) {
                matches_begin = link.match(new RegExp('\\' + quote_begin + '(?!$)', 'g'));
                matches_end = link.match(new RegExp('\\' + quote_end, 'g'));
                if ((matches_begin ? matches_begin.length : 0) < (matches_end ? matches_end.length : 0)) {
                    link = link.substring(0, link.length - 1);
                    idx_last--;
                }
            }
            if (options.punct_regexp) {
                link = link.replace(options.punct_regexp, function (a) {
                    idx_last -= a.length;
                    return '';
                });
            }
        } while (link.length && link !== link_last);

        href = link;
        if (!SCHEME_RE.test(href)) {
            href = linkifyCommon(href) + href;
        }

        if (idx_prev !== idx) {
            parts.push([txt.slice(idx_prev, idx)]);
            idx_prev = idx_last;
        }
        parts.push([link, href]);
    }
    parts.push([txt.substr(idx_prev)]);
    for (i = 0; i < parts.length; i++) {
        html += options.callback.apply(window, parts[i]);
    }
    return html || txt;
}
