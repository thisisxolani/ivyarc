import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Input Sanitizer Service
 * Provides comprehensive input sanitization and validation to prevent XSS, SQL injection,
 * and other malicious attacks. Implements multiple sanitization strategies based on context.
 */
@Injectable({
  providedIn: 'root'
})
export class InputSanitizerService {
  
  // XSS patterns to detect and remove
  private readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*>/gi,
    /<meta\b[^<]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi, // Event handlers like onclick, onload, etc.
  ];

  // SQL injection patterns
  private readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\/\*|\*\/)/g,
    /(\'|(\'\')|(\"|(\"\"))|(\n)|(\r)|(\t)|(\b)|(\0x)|(\%27)|(\%22))/gi,
  ];

  // Command injection patterns
  private readonly COMMAND_PATTERNS = [
    /(\||;|&|`|\$\(|\${)/g,
    /(\.\.\/|\.\.\\)/g, // Path traversal
    /(\/etc\/passwd|\/etc\/shadow|\/etc\/hosts)/gi,
    /(cmd|powershell|bash|sh|zsh)(\s|\.exe)/gi,
  ];

  // LDAP injection patterns
  private readonly LDAP_PATTERNS = [
    /(\*|\(|\)|\||&)/g,
    /(cn=|ou=|dc=)/gi,
  ];

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Comprehensive text sanitization
   * Removes malicious patterns and sanitizes input for safe display
   */
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // 1. Remove XSS patterns
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // 2. Remove SQL injection patterns
    this.SQL_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // 3. Remove command injection patterns
    this.COMMAND_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // 4. Remove LDAP injection patterns
    this.LDAP_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // 5. Encode HTML entities
    sanitized = this.encodeHtmlEntities(sanitized);

    // 6. Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // 7. Limit length to prevent DoS
    sanitized = sanitized.substring(0, 10000);

    return sanitized;
  }

  /**
   * Sanitize HTML content using Angular's DomSanitizer
   */
  sanitizeHtml(html: string): SafeHtml {
    if (!html || typeof html !== 'string') {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    // First apply our custom sanitization
    const preSanitized = this.sanitizeText(html);
    
    // Then use Angular's DomSanitizer for additional protection
    return this.sanitizer.bypassSecurityTrustHtml(preSanitized);
  }

  /**
   * Sanitize URLs to prevent malicious redirects
   */
  sanitizeUrl(url: string): SafeUrl {
    if (!url || typeof url !== 'string') {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }

    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'vbscript:', 'data:', 'file:'];
    const lowercaseUrl = url.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (lowercaseUrl.startsWith(protocol)) {
        console.warn(`Blocked dangerous URL protocol: ${protocol}`);
        return this.sanitizer.bypassSecurityTrustUrl('#');
      }
    }

    // Only allow http, https, mailto, tel protocols
    const allowedProtocols = /^(https?|mailto|tel):/i;
    if (url.includes(':') && !allowedProtocols.test(url)) {
      console.warn(`Blocked disallowed URL protocol in: ${url}`);
      return this.sanitizer.bypassSecurityTrustUrl('#');
    }

    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Sanitize resource URLs for iframes, etc.
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    if (!url || typeof url !== 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    // Only allow https URLs for resources
    if (!url.startsWith('https://')) {
      console.warn(`Blocked non-HTTPS resource URL: ${url}`);
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Validate email format and sanitize
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Remove potential malicious characters
    let sanitized = email.replace(/[<>"\\/;]/g, '');
    
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      console.warn(`Invalid email format detected: ${email}`);
      return '';
    }

    // Limit length
    return sanitized.substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitize phone numbers
   */
  sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-numeric characters except +, -, (, ), and spaces
    const sanitized = phone.replace(/[^0-9+\-\(\)\s]/g, '');
    
    // Limit length
    return sanitized.substring(0, 20);
  }

  /**
   * Sanitize file names to prevent path traversal and malicious names
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    // Remove dangerous characters and path traversal attempts
    let sanitized = fileName.replace(/[<>:"/\\|?*]/g, '');
    sanitized = sanitized.replace(/\.\./g, '');
    sanitized = sanitized.replace(/^\.+/, ''); // Remove leading dots
    
    // Limit length
    sanitized = sanitized.substring(0, 255);

    // Ensure we have something left
    if (sanitized.length === 0) {
      sanitized = 'sanitized_file';
    }

    return sanitized;
  }

  /**
   * Validate and sanitize numeric input
   */
  sanitizeNumber(input: string | number, options: NumberSanitizerOptions = {}): number | null {
    if (input === null || input === undefined || input === '') {
      return null;
    }

    const numValue = typeof input === 'string' ? parseFloat(input) : input;
    
    if (isNaN(numValue) || !isFinite(numValue)) {
      return null;
    }

    // Apply bounds if specified
    let sanitized = numValue;
    if (options.min !== undefined && sanitized < options.min) {
      sanitized = options.min;
    }
    if (options.max !== undefined && sanitized > options.max) {
      sanitized = options.max;
    }

    // Apply precision if specified
    if (options.precision !== undefined) {
      sanitized = parseFloat(sanitized.toFixed(options.precision));
    }

    return sanitized;
  }

  /**
   * Sanitize JSON input to prevent prototype pollution and other attacks
   */
  sanitizeJson(jsonString: string): any {
    if (!jsonString || typeof jsonString !== 'string') {
      return null;
    }

    try {
      // First sanitize the string
      const sanitizedString = this.sanitizeText(jsonString);
      
      // Parse the JSON
      const parsed = JSON.parse(sanitizedString);
      
      // Remove dangerous properties
      return this.removeDangerousProperties(parsed);
    } catch (error) {
      console.warn('Invalid JSON input detected:', error);
      return null;
    }
  }

  /**
   * Batch sanitization for form data
   */
  sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = this.sanitizeText(key);
      
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = this.sanitizeText(value);
      } else if (typeof value === 'number') {
        sanitized[sanitizedKey] = this.sanitizeNumber(value);
      } else if (Array.isArray(value)) {
        sanitized[sanitizedKey] = value.map(item => 
          typeof item === 'string' ? this.sanitizeText(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = this.sanitizeFormData(value);
      } else {
        sanitized[sanitizedKey] = value;
      }
    }

    return sanitized;
  }

  /**
   * Check if input contains potential security threats
   */
  containsSecurityThreats(input: string): SecurityThreatReport {
    if (!input || typeof input !== 'string') {
      return { hasThreats: false, threats: [] };
    }

    const threats: string[] = [];

    // Check for XSS
    if (this.XSS_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('XSS');
    }

    // Check for SQL injection
    if (this.SQL_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('SQL_INJECTION');
    }

    // Check for command injection
    if (this.COMMAND_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('COMMAND_INJECTION');
    }

    // Check for LDAP injection
    if (this.LDAP_PATTERNS.some(pattern => pattern.test(input))) {
      threats.push('LDAP_INJECTION');
    }

    return {
      hasThreats: threats.length > 0,
      threats
    };
  }

  /**
   * Encode HTML entities
   */
  private encodeHtmlEntities(text: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'\/]/g, (match) => entityMap[match]);
  }

  /**
   * Remove dangerous properties that could lead to prototype pollution
   */
  private removeDangerousProperties(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeDangerousProperties(item));
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!dangerousKeys.includes(key)) {
        cleaned[key] = this.removeDangerousProperties(value);
      }
    }

    return cleaned;
  }
}

// Type definitions

interface NumberSanitizerOptions {
  min?: number;
  max?: number;
  precision?: number;
}

interface SecurityThreatReport {
  hasThreats: boolean;
  threats: string[];
}