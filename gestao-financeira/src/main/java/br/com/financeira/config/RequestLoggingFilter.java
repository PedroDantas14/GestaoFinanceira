package br.com.financeira.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que loga no console cada requisição que chega no backend:
 * método HTTP, URI, status da resposta e tempo em ms.
 * Útil para acompanhar chamadas do frontend durante o desenvolvimento.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            String tokenInfo = request.getHeader("Authorization") != null ? " [com token]" : " [sem token]";
            log.info("{} {} -> {} ({} ms){}",
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    duration,
                    tokenInfo);
        }
    }
}
