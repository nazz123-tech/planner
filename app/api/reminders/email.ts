export interface DueTask {
    title: string;
    date: string;
    time: string;
    description?: string;
}

interface BuildArgs {
    name: string | null;
    tasks: DueTask[];
    appUrl: string;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Deliberately plain and transactional: a real subject line naming the task,
 * a text part alongside the HTML, no images, no tracking pixels, no buttons
 * and no marketing copy. That is what keeps it out of the spam folder and
 * makes it read like a reminder rather than a broadcast.
 */
export function buildReminderEmail({ name, tasks, appUrl }: BuildArgs) {
    const first = tasks[0];
    const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi,";

    const subject =
        tasks.length === 1
            ? `Reminder: ${first.title} at ${first.time}`
            : `Reminder: ${tasks.length} tasks starting soon`;

    const lead =
        tasks.length === 1
            ? `${first.title} starts at ${first.time} today — about two hours from now.`
            : `You have ${tasks.length} tasks starting in about two hours:`;

    const lines = tasks.map((task) =>
        task.description
            ? `- ${task.time} ${task.title} — ${task.description}`
            : `- ${task.time} ${task.title}`,
    );

    const text = [
        greeting,
        "",
        lead,
        ...(tasks.length === 1 ? [] : ["", ...lines]),
        "",
        appUrl ? `Open your planner: ${appUrl}/calendar` : "",
        "",
        "You're receiving this because reminders are on for your Planly account.",
        appUrl ? `Turn them off any time in ${appUrl}/dashboard.` : "",
    ]
        .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
        .join("\n");

    const listHtml =
        tasks.length === 1
            ? ""
            : `<ul style="margin:12px 0;padding-left:20px">${tasks
                  .map(
                      (task) =>
                          `<li style="margin-bottom:6px"><strong>${escapeHtml(
                              task.time,
                          )}</strong> ${escapeHtml(task.title)}${
                              task.description
                                  ? ` — ${escapeHtml(task.description)}`
                                  : ""
                          }</li>`,
                  )
                  .join("")}</ul>`;

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#22301f;max-width:520px">
<p style="margin:0 0 12px">${escapeHtml(greeting)}</p>
<p style="margin:0 0 12px">${escapeHtml(lead)}</p>
${listHtml}
${
    appUrl
        ? `<p style="margin:12px 0"><a href="${appUrl}/calendar" style="color:#2c4a3e">Open your planner</a></p>`
        : ""
}
<p style="margin:20px 0 0;font-size:12px;color:#6b7a70">You're receiving this because reminders are on for your Planly account.${
        appUrl
            ? ` You can turn them off in <a href="${appUrl}/dashboard" style="color:#6b7a70">your dashboard</a>.`
            : ""
    }</p>
</div>`;

    return { subject, text, html };
}
