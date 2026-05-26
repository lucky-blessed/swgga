// src/lib/auth/email-validation.ts
// 3-layer email validation:
// 1. Format validation — RFC 5322 regex
// 2. Domain blocklist — 500+ known disposable/temporary email providers
// 3. MX record check handled server-side via DNS lookup

// ─── Layer 1: Format validation ───────────────────────────────────────────────

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase())
}

// ─── Layer 2: Disposable email domain blocklist ───────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  'mailinator.com', 'mailinator2.com', 'mailinator.net', 'mailinater.com',
  'suremail.info', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  // Guerrilla Mail family
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.de',
  'guerrillamail.biz', 'guerrillamail.info', 'grr.la', 'guerrillamailblock.com',
  'spam4.me', 'yopmail.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf',
  'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr',
  // Temp mail services
  'tempmail.com', 'tempmail.net', 'tempmail.org', 'temp-mail.org', 'temp-mail.io',
  'tempmail.io', 'tempr.email', 'dispostable.com', 'throwam.com', 'throwam.net',
  'throwam.org', 'throwam.biz', 'throwam.info', 'trashmail.at', 'trashmail.com',
  'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  'trashmail.xyz', 'trashmailer.com', 'trashcanmail.com',
  // 10 minute mail
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.co.uk',
  '10minutemail.de', '10minutemail.nl', '10minutemail.pro', '10minutemail.ru',
  '10minutemail.us', '10minemail.com', 'minutemailbox.com',
  // Fake mail services
  'fakeinbox.com', 'fakemail.fr', 'fakemailgenerator.com', 'fakemailgenerator.net',
  'maildrop.cc', 'mailnull.com', 'mailnew.com', 'mailscrap.com',
  'mailseal.de', 'mailshell.com', 'mailslapping.com', 'mailslite.com',
  'mailsponge.com', 'mailtemp.info', 'mailtemporaire.com', 'mailtemporaire.fr',
  // Spam/throw-away
  'spambox.us', 'spambox.info', 'spambox.irishspringrealty.com',
  'spamcero.com', 'spamdecoy.net', 'spamfree24.org', 'spamgap.com',
  'spamhereplease.com', 'spamhole.com', 'spamify.com', 'spaminator.de',
  'spamkill.info', 'spaml.com', 'spaml.de', 'spammotel.com', 'spamoff.de',
  'spamoverdose.com', 'spampal.org', 'spamslicer.com', 'spamspot.com',
  'spamstack.net', 'spamthis.co.uk', 'spamthisplease.com', 'spamtroll.net',
  // Sharklasers / Guerrilla variants
  'sharklasers.com', 'guerrillamailblock.com', 'jetable.pp.ua', 'niggur.com',
  'rvb.ro', 'spam4.me', 'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
  // Disposable variants
  'discard.email', 'discardmail.com', 'discardmail.de', 'dispose.it',
  'disposeamail.com', 'disposableemailaddresses.com', 'disposableemailaddresses.emailmiser.com',
  'disposableinbox.com', 'disposed.it', 'disposemail.com',
  // One-time / burner
  'burnermail.io', 'burnthespam.info', 'byom.de', 'crap.handcrafted.jp',
  'crapmail.org', 'cust.in', 'dacoolest.com', 'dandikmail.com',
  'dayrep.com', 'dbunker.com', 'dcemail.com', 'deadaddress.com',
  'deadletter.ga', 'deagot.com', 'deal-maker.com', 'despam.it',
  'despammed.com', 'devnullmail.com', 'dingbone.com',
  // Dodgy TLDs used for spam
  'dontreg.com', 'dontsendmespam.de', 'drdrb.com', 'drdrb.net',
  'dump-email.info', 'dumpandfuck.com', 'dumpmail.de', 'dumpyemail.com',
  'e4ward.com', 'easytrashmail.com', 'egzones.com', 'einmalmail.de',
  'email60.com', 'emaildienst.de', 'emailgo.de', 'emailias.com',
  'emailigo.com', 'emailinfive.com', 'emailisvalid.com', 'emailmiser.com',
  'emailproxsy.com', 'emailsensei.com', 'emailtemporanea.com',
  'emailtemporanea.net', 'emailtemporar.ro', 'emailtemporary.com',
  'emailthe.net', 'emailtmp.com', 'emailwarden.com', 'emailx.at.hm',
  'emailxfer.com', 'emz.net', 'enterto.com', 'ephemail.net',
  'etranquil.com', 'etranquil.net', 'etranquil.org',
  // More temp services
  'explodemail.com', 'express.net.ua', 'eyepaste.com', 'fastacura.com',
  'fastchevy.com', 'fastchrysler.com', 'fastkawasaki.com', 'fastmazda.com',
  'fastnissan.com', 'fastsubaru.com', 'fastsuzuki.com', 'fasttoyota.com',
  'fastyamaha.com', 'filzmail.com', 'fixmail.tk', 'fizmail.com',
  'fleckens.hu', 'frapmail.com', 'freundinnen.net', 'front14.org',
  'fudgerub.com', 'fux0ringduh.com', 'fyii.de',
  // Getairmail family
  'getairmail.com', 'getmails.eu', 'getonemail.com', 'getonemail.net',
  'gishpuppy.com', 'gowikibooks.com', 'gowikicampus.com', 'gowikicars.com',
  'gowikifilms.com', 'gowikigames.com', 'gowikimusic.com', 'gowikinetwork.com',
  'gowikitravel.com', 'gowikitv.com', 'grandmamail.com', 'grandmasmail.com',
  'grofmusic.com', 'gsrv.co.uk', 'gustr.com',
  // H
  'h8s.org', 'haltospam.com', 'harakirimail.com', 'hartbot.de',
  'hatespam.org', 'herp.in', 'hidemail.de', 'hidzz.com',
  'hmamail.com', 'hopemail.biz', 'hulapla.de',
  // I
  'ieatspam.eu', 'ieatspam.info', 'ieh-mail.de', 'ihateyoualot.info',
  'iheartspam.org', 'imails.info', 'inbax.tk', 'inbox.si',
  'inboxalias.com', 'incognitomail.com', 'incognitomail.net', 'incognitomail.org',
  'inoutmail.de', 'inoutmail.eu', 'inoutmail.info', 'inoutmail.net',
  'insorg-mail.info', 'instant-mail.de', 'instantemailaddress.com',
  'ipoo.org', 'irish2me.com',
  // J-K
  'jnxjn.com', 'jourrapide.com', 'jsrsolutions.com', 'jupimail.com',
  'kasmail.com', 'kaspop.com', 'keepmymail.com', 'killmail.com',
  'killmail.net', 'klassmaster.com', 'klzlk.com', 'koszmail.pl',
  'kurzepost.de', 'kyois.com',
  // L-M
  'l33r.eu', 'laoeq.com', 'lawlita.com', 'lazyinbox.com',
  'letthemeatspam.com', 'lhsdv.com', 'lifebyfood.com', 'link2mail.net',
  'litedrop.com', 'lol.ovpn.to', 'lookugly.com', 'lortemail.dk',
  'losemymail.com', 'lovemeleaveme.com', 'lovemeleaveme.net',
  'lr78.com', 'lukop.dk', 'lycos.com',
  // Mailnesia family
  'mailnesia.com', 'mailnull.com', 'mailpick.biz', 'mailproxsy.com',
  'mailquack.com', 'mailrock.biz', 'mailsiphon.com', 'mailzilla.com',
  'mailzilla.org', 'mbx.cc', 'mega.zik.dj', 'meinspamschutz.de',
  'meltmail.com', 'messagebeamer.de', 'mezmail.com', 'mierdamail.com',
  'migmail.net', 'migmail.pl', 'migumail.com', 'mintemail.com',
  'mobileninja.co.uk', 'moburl.com', 'moncourrier.fr.nf',
  'monemail.fr.nf', 'monmail.fr.nf', 'msa.minsmail.com',
  'mt2009.com', 'mt2014.com', 'mvpmail.com', 'my10minutemail.com',
  'myalias.pw', 'myblacklist.net', 'mycorner.no', 'myemailboxy.com',
  'myfastmail.com', 'mymailoasis.com', 'mynetstore.de', 'myopmail.com',
  'mypartyclip.de', 'myphantomemail.com', 'myspaceinc.com', 'myspaceinc.net',
  'myspaceinc.org', 'myspacepimpedup.com', 'myspamless.com', 'mytemp.email',
  'mytempmail.com', 'mytrashmail.com',
  // N-O
  'nabuma.com', 'neomailbox.com', 'nepwk.com', 'nervmich.net',
  'nervtmich.net', 'netmails.com', 'netmails.net', 'netzidiot.de',
  'neverbox.com', 'nice-4u.com', 'nincsmail.hu', 'nmail.cf',
  'no-spam.ws', 'noblepioneer.com', 'nomail.pw', 'nomail.xl.cx',
  'nomail2me.com', 'nomorespamemails.com', 'nonspam.eu', 'nonspammer.de',
  'noref.in', 'norseforce.com', 'nospam.ze.tc', 'nospam4.us',
  'nospamfor.us', 'nospammail.net', 'nospamthanks.info', 'notmailinator.com',
  'nowmymail.com', 'ntlhelp.net', 'nullbox.info', 'nwldx.com',
  'objectmail.com', 'obobbo.com', 'odaymail.com', 'okok.pl', 'one-time.email',
  'oneoffemail.com', 'oneoffmail.com', 'onewaymail.com', 'online.ms',
  'onqin.com', 'opayq.com', 'ordinaryamerican.net', 'otherinbox.com',
  'ourklips.com', 'outlawspam.com', 'ovpn.to', 'owlpic.com',
  // P-Q
  'pancakemail.com', 'paplease.com', 'pcusers.otherinbox.com',
  'pepbot.com', 'peterdethier.com', 'phentermine-mortgages.com',
  'pimpedupmyspace.com', 'pjjkp.com', 'plexolan.de', 'poczta.onet.pl',
  'politikerclub.de', 'poomail.com', 'popcornfly.com', 'postacı.org',
  'postonline.me', 'privacy.net', 'proxymail.eu', 'prtnx.com',
  'prtz.eu', 'pubmail.io', 'putthisinyourspamdatabase.com',
  'putthisinyourspamdatabase.net', 'pwrby.com',
  // R-S
  'quickinbox.com', 'quickmail.nl',
  'rcpt.at', 'recode.me', 'recursor.net', 'recyclebox.tk',
  'recyclemail.dk', 'regbypass.com', 'regbypass.comsafe-mail.net',
  'rejectmail.com', 'rklips.com', 'rmqkr.net', 'royal.net',
  'rppkn.com', 'rtrtr.com',
  's0ny.net', 'safe-mail.net', 'safersignup.de', 'safetymail.info',
  'safetypost.de', 'sandelf.de', 'saynotospams.com', 'scatmail.com',
  'selfdestructingmail.com', 'sendspamhere.com', 'sharklasers.com',
  'shieldemail.com', 'shitmail.de', 'shitmail.me', 'shitmail.org',
  'shitware.nl', 'shortmail.net', 'sibmail.com', 'sinnlos-mail.de',
  'siteposter.net', 'skeefmail.com', 'slapsfromlastnight.com',
  'slaskpost.se', 'slopsbox.com', 'smellfear.com', 'snakemail.com',
  'sneakemail.com', 'sneakmail.de', 'snkmail.com', 'sofimail.com',
  'sofort-mail.de', 'sogetthis.com', 'soisz.com', 'sol.dk',
  'spam.la', 'spam.su', 'spam4.me', 'spamavert.com',
  'spambob.com', 'spambob.net', 'spambob.org', 'spambog.com',
  'spambog.de', 'spambog.ru', 'spamboxtb.com', 'spamcon.org',
  'spamcorptastic.com', 'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org',
  'spamday.com', 'spamex.com', 'spamfree.eu', 'spamfree24.de',
  'spamfree24.eu', 'spamfree24.info', 'spamfree24.net', 'spamfree24.org',
  // T
  'tempalias.com', 'tempinbox.com', 'tempinbox.net', 'tempmail.eu',
  'tempomail.fr', 'temporaryemail.com', 'temporaryemail.net',
  'temporaryforwarding.com', 'temporaryinbox.com', 'temporarymail.org',
  'tempymail.com', 'thanksnospam.info', 'thecloudindex.com',
  'theteastory.info', 'thisisnotmyrealemail.com', 'throwam.com',
  'throwaway.email', 'throwaways.net', 'throwam.net',
  'throwam.org', 'throwam.biz', 'throwam.info',
  // U-Z
  'uggsrock.com', 'umail.net', 'uroid.com',
  'veryrealemail.com', 'viditag.com', 'viralplays.com', 'vpn.st',
  'vsimcard.com', 'vubby.com',
  'warnme.ne.kr', 'webemail.me', 'webm4il.info', 'weg-werf-email.de',
  'wegwerf-emails.de', 'wegwerfadresse.de', 'wegwerfemail.com',
  'wegwerfemail.de', 'wegwerfemail.net', 'wegwerfemail.org',
  'wegwerfmail.de', 'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org',
  'wegwerfmails.de', 'wegwerfnummer.de', 'wh4f.org', 'whyspam.me',
  'willhackforfood.biz', 'willselfdestruct.com', 'winemaven.info',
  'wronghead.com', 'wuzup.net', 'wuzupmail.net',
  'xagloo.com', 'xemaps.com', 'xents.com', 'xmaily.com', 'xoxy.net',
  'xyzfree.net', 'yapped.net', 'yepmail.net', 'yert.ye.vc',
  'yogamaven.com', 'yopmail.com', 'yopmail.fr', 'yourdomain.com',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com',
  'z1p.biz', 'za.com', 'zehnminuten.de', 'zehnminutenmail.de',
  'zippymail.info', 'zoemail.com', 'zoemail.net', 'zoemail.org',
  'zomg.info',
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1]
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}

// ─── Layer 3: DNS MX record validation ───────────────────────────────────────
// Server-side only — checks if the domain has valid mail exchange records

export async function hasMxRecord(email: string): Promise<boolean> {
  try {
    const domain = email.trim().toLowerCase().split('@')[1]
    if (!domain) return false

    const { promises: dns } = await import('dns')
    const records = await dns.resolveMx(domain)
    return records.length > 0
  } catch {
    return false
  }
}

// ─── Combined validation ──────────────────────────────────────────────────────

export interface EmailValidationResult {
  valid:   boolean
  error?:  string
}

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  if (!email?.trim()) {
    return { valid: false, error: 'Email address is required' }
  }

  if (!isValidEmailFormat(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      error: 'Disposable or temporary email addresses are not allowed. Please use a permanent email address.'
    }
  }

  const hasMx = await hasMxRecord(email)
  if (!hasMx) {
    return {
      valid: false,
      error: 'This email domain does not appear to be valid. Please check your email address.'
    }
  }

  return { valid: true }
}
