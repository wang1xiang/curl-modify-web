const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// 值生成器
function generateValue(type, spec) {
  switch (type) {
    case 'fixed':
      return spec;
    case 'int': {
      const [min, max] = spec.split('-').map(Number);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    case 'string': {
      console.log('String generator called with spec:', JSON.stringify(spec));
      const parts = (spec || '8:mix').split(':');
      const length = parseInt(parts[0]) || 8;
      const lang = parts[1] || 'mix';
      console.log('Parsed - length:', length, 'lang:', lang);

      let chars = '';
      switch (lang) {
        case 'zh':
          // 常用汉字
          const commonChinese = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感见明问力理尔点文几定本公特做外孩相西果走将月十实向声车全信重三机工物气每并别真打太新比才便夫再书部水像眼少家经';
          chars = commonChinese;
          break;
        case 'en':
          chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          break;
        case 'num':
          chars = '0123456789';
          break;
        case 'mix':
        default:
          chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          break;
      }

      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    case 'date': {
      const format = spec || 'YYYY-MM-DD HH:mm:ss';
      const now = new Date();
      const randomOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
      const date = new Date(now.getTime() + randomOffset);
      return format
        .replace('YYYY', date.getFullYear())
        .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(date.getDate()).padStart(2, '0'))
        .replace('HH', String(date.getHours()).padStart(2, '0'))
        .replace('mm', String(date.getMinutes()).padStart(2, '0'))
        .replace('ss', String(date.getSeconds()).padStart(2, '0'));
    }
    case 'list':
      const items = spec.split(',');
      return items[Math.floor(Math.random() * items.length)];
    case 'phone':
      // 中国手机号：13x, 15x, 17x, 18x, 19x 开头
      const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                        '150', '151', '152', '153', '155', '156', '157', '158', '159',
                        '170', '171', '173', '175', '176', '177', '178',
                        '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
                        '190', '191', '192', '193', '195', '196', '197', '198', '199'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let suffix = '';
      for (let i = 0; i < 8; i++) {
        suffix += Math.floor(Math.random() * 10);
      }
      return prefix + suffix;
    case 'email':
      const emailChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'yeah.net', 'sina.com'];
      let emailName = '';
      const emailLen = 6 + Math.floor(Math.random() * 10);
      for (let i = 0; i < emailLen; i++) {
        emailName += emailChars.charAt(Math.floor(Math.random() * emailChars.length));
      }
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return emailName + '@' + domain;
    case 'url':
      const urlChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const protocols = ['http://', 'https://'];
      const tlds = ['.com', '.cn', '.net', '.org', '.io', '.co', '.me', '.tv'];
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      let hostname = '';
      const hostLen = 5 + Math.floor(Math.random() * 15);
      for (let i = 0; i < hostLen; i++) {
        hostname += urlChars.charAt(Math.floor(Math.random() * urlChars.length));
      }
      const tld = tlds[Math.floor(Math.random() * tlds.length)];
      const hasPath = Math.random() > 0.5;
      let path = '';
      if (hasPath) {
        const pathLen = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < pathLen; i++) {
          let segment = '';
          const segLen = 3 + Math.floor(Math.random() * 10);
          for (let j = 0; j < segLen; j++) {
            segment += urlChars.charAt(Math.floor(Math.random() * urlChars.length));
          }
          path += '/' + segment;
        }
      }
      return protocol + hostname + tld + path;
    default:
      return spec;
  }
}

// 设置嵌套值
function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

// 解析 curl 命令
function parseCurl(cmd) {
  const result = {
    method: 'GET',
    url: '',
    headers: {},
    body: null
  };

  // 提取 URL
  const urlMatch = cmd.match(/(https?:\/\/[^'\s]+)/);
  if (urlMatch) {
    result.url = urlMatch[1];
  }

  // 提取 method
  const methodMatch = cmd.match(/-X\s+(\w+)/);
  if (methodMatch) {
    result.method = methodMatch[1];
  }

  // 提取 headers
  const headerRegex = /-H\s+(['"])(.*?)\1/g;
  let headerMatch;
  while ((headerMatch = headerRegex.exec(cmd)) !== null) {
    const header = headerMatch[2];
    const colonIdx = header.indexOf(':');
    if (colonIdx > 0) {
      const key = header.slice(0, colonIdx).trim();
      const value = header.slice(colonIdx + 1).trim();
      result.headers[key] = value;
    }
  }

  // 提取 body (--data-raw, --data, -d)
  const bodyMatch = cmd.match(/--data-raw\s+(['"])(.*?)\1/) ||
                   cmd.match(/--data\s+(['"])(.*?)\1/) ||
                   cmd.match(/-d\s+(['"])(.*?)\1/);
  if (bodyMatch) {
    result.body = bodyMatch[2];
    if (result.method === 'GET') result.method = 'POST';
  }

  return result;
}

// 构建 curl 命令
function buildCurl(parsed) {
  let cmd = ['curl'];

  if (parsed.method !== 'GET') {
    cmd.push(`-X ${parsed.method}`);
  }

  cmd.push(`'${parsed.url}'`);

  for (const [key, value] of Object.entries(parsed.headers)) {
    cmd.push(`-H '${key}: ${value}'`);
  }

  if (parsed.body) {
    cmd.push(`--data-raw '${parsed.body.replace(/'/g, "'\\''")}'`);
  }

  return cmd.join(' \\\n  ');
}

// API: 解析 curl
app.post('/api/parse', (req, res) => {
  try {
    const { curlCmd } = req.body;
    const parsed = parseCurl(curlCmd);
    let bodyJson = null;
    if (parsed.body) {
      try {
        bodyJson = JSON.parse(parsed.body);
      } catch (e) {
        // 不是 JSON body
      }
    }
    res.json({ success: true, parsed, bodyJson });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: 生成修改后的请求
app.post('/api/generate', (req, res) => {
  try {
    const { parsed, modifiers, headerMods, count } = req.body;
    console.log('Received modifiers:', modifiers);
    console.log('Received headerMods:', headerMods);
    const requests = [];

    for (let i = 0; i < count; i++) {
      const modified = { ...parsed, headers: headerMods ? { ...headerMods } : { ...parsed.headers } };

      if (modified.body) {
        try {
          let body = JSON.parse(modified.body);
          for (const [path, mod] of Object.entries(modifiers || {})) {
            console.log(`Generating ${mod.type} with spec: "${mod.spec}"`);
            const value = generateValue(mod.type, mod.spec);
            console.log(`Generated value:`, value);
            setNestedValue(body, path, value);
          }
          modified.body = JSON.stringify(body);
        } catch (e) {
          console.error('Body parse error:', e);
        }
      }

      requests.push({
        index: i + 1,
        curlCmd: buildCurl(modified),
        body: modified.body
      });
    }

    res.json({ success: true, requests });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: 发送请求
app.post('/api/send', async (req, res) => {
  try {
    const { curlCmd } = req.body;

    const result = await new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', curlCmd]);
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`curl exited with code ${code}: ${stderr}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    res.json({ success: true, ...result });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// 调试端点：直接测试解析
app.post('/api/debug-parse', (req, res) => {
  try {
    const { curlCmd } = req.body;
    const cleanCmd = curlCmd.replace(/\\\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

    const urlMatch = curlCmd.match(/(https?:\/\/[^'\s]+)/);
    const bodyMatch = curlCmd.match(/--data-raw\s+(['"])(.*?)\1/) ||
                     curlCmd.match(/--data\s+(['"])(.*?)\1/) ||
                     curlCmd.match(/-d\s+(['"])(.*?)\1/);

    let parsedBody = null;
    if (bodyMatch && bodyMatch[2]) {
      try {
        parsedBody = JSON.parse(bodyMatch[2]);
      } catch (e) {
        parsedBody = { error: e.message, raw: bodyMatch[2] };
      }
    }

    res.json({
      success: true,
      cleanCmd: cleanCmd.substring(0, 500),
      urlMatch: !!urlMatch,
      url: urlMatch ? urlMatch[1] : null,
      bodyMatch: !!bodyMatch,
      bodyRaw: bodyMatch ? bodyMatch[2] : null,
      parsedBody
    });
  } catch (e) {
    res.json({ success: false, error: e.message, stack: e.stack });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Curl Modify Tool 服务器已启动`);
  console.log(`请在浏览器中打开: http://localhost:${PORT}`);
});
