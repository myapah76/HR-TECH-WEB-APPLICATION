package hrtech.payment.schedulers;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import hrtech.payment.abstractions.services.IPaymentService;

@Component
@RequiredArgsConstructor
@Log4j2
public class PaymentReconciliationScheduler {

    private final IPaymentService paymentService;

    @Scheduled(cron = "0 */10 * * * *")
    @Transactional
    public void reconcilePendingPayments(){
        log.info("Starting reconcile pending payments");
        paymentService.reconcilePendingPayments();
    }
}
