import { Attachment, Schedule } from '../../src/services/schedule'

test.each([
    [new Date(), "today schedule", "nothing", []],
    [new Date(2022, 2, 3), "schedule 1", "nothing", []],
    [new Date(1999, 12, 30), "schedule 2", "attachment", [new Attachment("school.txt", Buffer.from("Sunrin Internet High School"), "text/plain")]]
])("", (date, title, body, attachment) => {
    const original = { date, title, body, attachment };
    const obj = new Schedule(date, title, body, attachment)
    expect(obj.date).toBe(date)
    expect(obj.title).toBe(title)
    expect(obj.body).toBe(body)
    expect(obj.attachment).toBe(attachment)
    expect(obj.toObject()).toEqual(original)
    expect(obj.toJSON()).toBe(JSON.stringify(original))
    expect(Schedule.fromObject(original)).toEqual(original)
    expect(Schedule.fromJSON(JSON.stringify(original))).toEqual(original)
})